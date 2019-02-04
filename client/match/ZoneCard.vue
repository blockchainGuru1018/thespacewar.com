<template>
    <div :style="cardStyle" :data-type="card.type || ''" :class="classes" ref="card">
        <div @click="enlargeClick" class="enlargeIcon"/>
        <div class="actionOverlays">
            <div v-if="canBeSelectedAsDefender"
                 @click.stop="selectAsDefender(card)"
                 class="attackable actionOverlay"/>
            <div v-else-if="canBeSelectedForRepair"
                 @click.stop="selectForRepair(card)"
                 class="selectForRepair actionOverlay"/>
            <template v-else-if="canSelectAction">
                <div v-if="canMove"
                     @click.stop="moveClick"
                     class="movable actionOverlay">
                    Move
                </div>
                <div v-if="canAttack"
                     @click.stop="readyToAttackClick"
                     class="readyToAttack actionOverlay">
                    Attack
                </div>
                <div v-if="canRepair"
                     @click="selectAsRepairer(card.id)"
                     class="repair actionOverlay">
                    Repair
                </div>
                <div v-if="canBeSacrificed"
                     @click="sacrifice(card.id)"
                     class="sacrifice actionOverlay">
                    Sacrifice
                </div>
                <div v-if="canBeDiscarded"
                     @click.stop="discardClick"
                     class="discard actionOverlay">
                    Discard
                </div>
            </template>
            <div v-if="canSelectCardForAction"
                 @click.stop="selectCardForActiveAction(card.id)"
                 class="selectable"/>
        </div>
        <div class="indicatorOverlays">
            <div v-if="card.damage && card.damage > 0" class="card-damageIndicator" :style="damageTextStyle">
                -{{ card.damage }}
            </div>
        </div>
        <portal to="match" v-if="showEnlargedCard">
            <div class="dimOverlay"/>
            <div class="card card--enlarged" :style="cardStyle" v-click-outside="hideEnlargedCard"/>
        </portal>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');
    const {
        mapState: mapCardState,
        mapGetters: mapCardGetters,
        mapMutations: mapCardMutations,
        mapActions: mapCardActions
    } = Vuex.createNamespacedHelpers('card');
    const {
        mapState: mapPermissionState,
        mapGetters: mapPermissionGetters,
        mapMutations: mapPermissionMutations,
        mapActions: mapPermissionActions
    } = Vuex.createNamespacedHelpers('permission');
    const vClickOutside = require('v-click-outside');

    module.exports = {
        props: [
            'card',
            'zonePlayerRow',
            'zoneOpponentRow',
            'ownerId',
            'isHomeZone'
        ],
        data() {
            return {
                damageTextFontSize: 0,
                wasPutDownTurn: null,
                showEnlargedCard: false
            }
        },
        computed: {
            ...mapState([
                'phase',
                'turn',
                'events',
                'attackerCardId',
                'ownUser',
                'repairerCardId'
            ]),
            ...mapGetters([
                'allOpponentStationCards',
                'createCard',
                'attackerCard'
            ]),
            ...mapPermissionGetters([
                'canSelectCardsForActiveAction',
            ]),
            ...mapCardState([
                'transientPlayerCardsInHomeZone',
                'activeAction',
                'activeActionCardData',
                'selectedCardIdsForAction',
                'checkIfCanBeSelectedForAction'
            ]),
            ...mapCardGetters([
                'activeActionCard'
            ]),
            classes() {
                const classes = ['card'];
                if (this.selectedAsAttacker) {
                    classes.push('selectedAsAttacker');
                }
                if (this.isActiveActionCard) {
                    classes.push('isActiveActionCard');
                }
                return classes;
            },
            cardStyle() {
                return {
                    backgroundImage: 'url(/card/' + this.card.commonId + '/image)'
                };
            },
            damageTextStyle() {
                return {
                    fontSize: this.damageTextFontSize + 'px'
                }
            },
            isPlayerCard() {
                return this.ownerId === this.ownUser.id;
            },
            selectedAsAttacker() {
                return this.attackerCardId === this.card.id;
            },
            isActiveActionCard() {
                return this.activeActionCardData && this.activeActionCardData.id === this.card.id;
            },
            canSelectAction() {
                if (!this.isPlayerCard) return false;

                return !this.attackerCardId
                    && !this.repairerCardId
                    && !this.activeAction;
            },
            canMove() {
                const card = this.createCard(this.card);
                return card.canMove();
            },
            canAttack() {
                if (this.attackerCardId) return false;

                const card = this.createCard(this.card);
                if (!card.canAttack()) return false;

                if (!card.canAttackCardsInOtherZone()
                    && !this.canAttackSomeCardInSameZone) return false; //TODO According to this you should be able to select card for attack even though there are no cards in the opposite zone.. seems like a bug!

                return true;
            },
            canBeSacrificed() {
                return this.createCard(this.card).canBeSacrificed();
            },
            canAttackSomeCardInSameZone() {
                return this.canAttackCardInZone || this.canAttackStationCards;
            },
            canAttackCardInZone() {
                const card = this.createCard(this.card);
                return this.zoneOpponentRow
                    .map(cardData => {
                        const isOpponent = !!this.isPlayerCard;
                        return this.createCard(cardData, { isOpponent });
                    })
                    .filter(target => card.canAttackCard(target))
                    .length > 0;
            },
            canAttackStationCards() {
                return this.createCard(this.card).canAttackStationCards()
                    && this.allOpponentStationCards.length > 0;
            },
            canBeSelectedAsDefender() {
                const card = this.createCard(this.card, { isOpponent: !this.isPlayerCard });
                return !this.isPlayerCard
                    && this.attackerCardId
                    && this.attackerCard.canAttackCard(card);
            },
            canBeDiscarded() {
                return this.card.type === 'duration'
                    && this.phase === 'preparation';
            },
            canRepair() {
                return this
                    .createCard(this.card)
                    .canRepair();
            },
            canBeSelectedForRepair() {
                if (!this.repairerCardId) return false;

                return this.createCard(this.card).canBeRepaired();
            },
            isSelectedForAction() {
                return this.selectedCardIdsForAction.includes(this.card.id);
            },
            canSelectCardForAction() {
                const cardIsTransient = this.transientPlayerCardsInHomeZone.some(c => c.id === this.card.id);
                if (cardIsTransient) return false;
                if (this.isPlayerCard) return false;
                if (!this.canSelectCardsForActiveAction) return false;
                if (this.isSelectedForAction) return false;

                const options = {
                    cardData: this.card,
                    isStationCard: false,
                    isOpponentCard: !this.isPlayerCard
                }
                return this.checkIfCanBeSelectedForAction(options);
            }
        },
        methods: {
            ...mapActions([
                'selectAsAttacker',
                'selectAsDefender',
                'moveCard',
                'discardDurationCard',
                'selectAsRepairer',
                'selectForRepair'
            ]),
            ...mapCardActions([
                'startSacrifice',
                'selectCardForActiveAction',
            ]),
            moveClick() {
                this.moveCard(this.card);
            },
            readyToAttackClick() {
                this.selectAsAttacker(this.card);
            },
            discardClick() {
                this.discardDurationCard(this.card);
            },
            enlargeClick() {
                this.showEnlargedCard = true;
            },
            hideEnlargedCard() {
                this.showEnlargedCard = false;
            },
            sacrifice() {
                this.startSacrifice(this.card.id);
            }
        },
        created() {
            const putDownEventForThisCard = this.events.find(e => {
                return e.type === 'putDownCard'
                    && e.cardId === this.card.id;
            });
            this.wasPutDownTurn = putDownEventForThisCard ? putDownEventForThisCard.turn : 0;
        },
        mounted() {
            if (!this.$refs.card) {
                throw Error(`Failed to render ZoneCard component with card data: ${JSON.stringify(this.card)}`);
            }
            else {
                let cardWidth = this.$refs.card.offsetWidth;
                this.damageTextFontSize = Math.round(cardWidth * .25);
            }
        },
        directives: {
            clickOutside: vClickOutside.directive
        }
    };
</script>
<style scoped lang="scss">
    @import "miscVariables";
    @import "card";
    @import "enlargeCard";

    .card {
        position: relative;
    }

    .actionOverlays, .indicatorOverlays {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
    }

    .actionOverlays {
        z-index: 2;
    }

    .indicatorOverlays {
        z-index: 1;
    }

    .actionOverlay {
        color: white;
        font-family: Helvetica, sans-serif;
        font-size: 16px;
        flex: 1 1;
        display: flex;
        align-items: center;
        justify-content: center;
        visibility: hidden;
        opacity: .5;
        cursor: pointer;

        &:hover {
            opacity: 1;
        }
    }

    .movable, .repair, .selectForRepair {
        background-color: rgba(0, 0, 0, .5);
    }

    .discard {
        background-color: rgba(0, 1, 51, .5);
    }

    .readyToAttack, .attackable, .sacrifice {
        background-color: rgba(255, 100, 100, .5);
    }

    .selectForRepair {
        background-color: rgba(100, 100, 255, .5);
    }

    .selectedAsAttacker, .isActiveActionCard {
        outline: 2px solid red;
    }

    .actionOverlays:hover {
        & .movable,
        & .readyToAttack,
        & .attackable,
        & .discard,
        & .repair,
        & .selectForRepair {
            visibility: visible;
        }
    }

    .card-damageIndicator {
        display: flex;
        padding-right: 5%;
        padding-bottom: 24%;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        align-items: flex-end;
        justify-content: flex-end;
        color: red;
        text-shadow: 1px 1px #333;
        font-weight: bold;
        font-family: Arial, sans-serif;
    }

    @keyframes fullOpacityOnIntentionalHover {
        0% {
            opacity: 0;
        }

        99% {
            opacity: 0;
        }

        100% {
            opacity: 1;
        }
    }
</style>
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
                <div v-if="canAttackThisTurn"
                     @click.stop="readyToAttackClick"
                     class="readyToAttack actionOverlay">
                    Attack
                </div>
                <div v-if="canRepair"
                     @click="selectAsRepairer(card.id)"
                     class="repair actionOverlay">
                    Repair
                </div>
                <div v-if="canBeDiscarded"
                     @click.stop="discardClick"
                     class="discard actionOverlay">
                    Discard
                </div>
            </template>
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
            classes() {
                const classes = ['card'];
                if (this.selectedAsAttacker) {
                    classes.push('selectedAsAttacker');
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
            canSelectAction() {
                if (!this.isPlayerCard) return false;

                return !this.attackerCardId
                    && !this.repairerCardId;
            },
            canMove() {
                const card = this.createCard(this.card);
                return card.canMove() && this.isHomeZone;
            },
            canAttack() {
                const card = this.createCard(this.card);
                return !this.attackerCardId && card.canAttack();
            },
            canAttackCardInZone() {
                return this.zoneOpponentRow
                    .filter(c => c.type !== 'duration')
                    .length > 0;
            },
            canAttackStationCards() {
                return this.createCard(this.card).canAttackStationCards()
                    && this.allOpponentStationCards.length > 0;
            },
            canAttackThisTurn() {
                const canAttackSomeTarget = (this.canAttackCardInZone || this.canAttackStationCards)
                return this.canAttack && canAttackSomeTarget;
            },
            canBeSelectedAsDefender() {
                const card = this.createCard(this.card);
                return !this.isPlayerCard
                    && this.attackerCardId
                    && this.zoneOpponentRow.some(c => c.id === this.attackerCardId)
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
    //Sync with Match.vue variables
    //TODO Move to common file
    $cardWidth: 652px;
    $cardHeight: 916px;
    $opponentCardWidth: calc(#{$cardWidth} / 8);
    $opponentCardHeight: calc(#{$cardHeight} / 8);
    $opponentCardOnHandWidth: calc(#{$cardWidth} / 12);
    $opponentCardOnHandHeight: calc(#{$cardHeight} / 12);
    $opponentStationCardWidth: calc(#{$cardWidth} / 12);
    $opponentStationCardHeight: calc(#{$cardHeight} / 12);
    $opponentDrawPileCardWidth: calc(#{$cardWidth} / 12);
    $opponentDrawPileCardHeight: calc(#{$cardHeight} / 12);
    $opponentDiscardPileCardWidth: calc(#{$cardWidth} / 12);
    $opponentDiscardPileCardHeight: calc(#{$cardHeight} / 12);

    $playerCardWidth: calc(#{$cardWidth} / 5);
    $playerCardHeight: calc(#{$cardHeight} / 5);
    $playerStationCardWidth: calc((#{$cardWidth} / 5) * .7);
    $playerStationCardHeight: calc((#{$cardHeight} / 5) * .7);
    $playerDiscardPileCardWidth: $playerCardWidth;
    $playerDiscardPileCardHeight: $playerCardHeight;
    $playerDrawPileCardWidth: $playerCardWidth;
    $playerDrawPileCardHeight: $playerCardHeight;

    $cardHoverWidth: $cardWidth / 4;
    $cardHoverHeight: $cardHeight / 4;

    $overlayColor: rgba(0, 0, 0, .4);

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

    .readyToAttack, .attackable {
        background-color: rgba(255, 100, 100, .5);
    }

    .selectForRepair {
        background-color: rgba(100, 100, 255, .5);
    }

    .selectedAsAttacker {
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

    .enlargeIcon {
        opacity: 0;
        background-image: url(/icon/enlarge-red.svg);
        background-size: contain;
        fill: red;
        position: absolute;
        top: 5px;
        right: 5px;
        width: 20px;
        height: 20px;
        z-index: 3;

        .card:hover & {
            animation: fullOpacityOnIntentionalHover .14s;
            opacity: 1;
        }
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

    .card--enlarged {
        $ratio: $cardWidth / $cardHeight;

        background-size: contain;
        width: 80vh * $ratio;
        height: 80vh;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 4;
    }

    .dimOverlay {
        background-color: $overlayColor;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 4;
    }
</style>
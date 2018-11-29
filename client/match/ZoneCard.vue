<template>
    <div :style="cardStyle" @click="cardClick" ref="card" :data-type="card.type || ''" :class="classes">
        <div class="actionOverlays">
            <template v-if="canSelectAction">
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
                <div v-if="canBeDiscarded" class="canBeDiscarded actionOverlay">
                    Discard
                </div>
            </template>
            <div v-if="canBeSelectedAsDefender"
                 @click.stop="selectAsDefender(card)"
                 class="attackable actionOverlay"/>
        </div>
        <div class="indicatorOverlays">
            <div v-if="card.damage && card.damage > 0" class="card-damageIndicator" :style="damageTextStyle">
                -{{ card.damage }}
            </div>
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');

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
                wasPutDownTurn: null
            }
        },
        computed: {
            ...mapState([
                'phase',
                'turn',
                'events',
                'attackerCardId',
                'ownUser'
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
                }
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

                return !this.attackerCardId;
            },
            canMove() {
                const card = this.createCard(this.card);
                return card.canMove() && this.isHomeZone;
            },
            canAttack() {
                const card = this.createCard(this.card);
                return !this.attackerCardId
                    && card.canAttack()
                    && !card.hasAttackedThisTurn();
            },
            canAttackCardInZone() {
                return this.zoneOpponentRow.length > 0;
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
            }
        },
        methods: {
            ...mapActions([
                'selectAsAttacker',
                'selectAsDefender',
                'moveCard',
                'discardDurationCard'
            ]),
            cardClick() {
                if (this.canBeDiscarded) {
                    this.discardDurationCard(this.card);
                }
                else {
                    this.$emit('click', this.card);
                }
            },
            moveClick() {
                this.moveCard(this.card);
            },
            readyToAttackClick() {
                this.selectAsAttacker(this.card);
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
            let cardWidth = this.$refs.card.offsetWidth;
            this.damageTextFontSize = Math.round(cardWidth * .25);
        }
    };
</script>
<style scoped lang="scss">
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

    .movable {
        background-color: rgba(0, 0, 0, .5);
    }

    .canBeDiscarded {
        background-color: rgba(0, 1, 51, .5);
    }

    .readyToAttack, .attackable {
        background-color: rgba(255, 100, 100, .5);
    }

    .selectedAsAttacker {
        outline: 2px solid red;
    }

    .actionOverlays:hover {
        & .movable, & .readyToAttack, & .attackable, & .canBeDiscarded {
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
</style>
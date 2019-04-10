<template>
    <div :style="cardStyle" :data-type="card.type || ''" :class="classes" ref="card">
        <div @click="enlargeClick" class="enlargeIcon"/>
        <div v-if="disabled" class="cardDisabledOverlay">
            <span class="cardDisabledOverlay-text"
                  :style="disabledOverlayTextStyle">
                X
            </span>
        </div>
        <div class="actionOverlays">
            <div v-if="canBeSelectedAsDefender"
                 @click.stop="selectAsDefender(card)"
                 class="attackable actionOverlay actionOverlay--turnedAround">
                <div v-if="predictedResultsIfAttacked.defenderParalyzed"
                     class="attackble-paralyzed actionOverlay-predictionText">
                    Paralyze
                </div>
                <div v-else-if="predictedResultsIfAttacked.defenderDestroyed"
                     class="actionOverlay-predictedLethal actionOverlay-predictionText">
                    ⇒0
                </div>
                <div v-else
                     class="actionOverlay-predictedDamageChange actionOverlay-predictionText">
                    {{ behaviourCard.defense - behaviourCard.damage }}
                    ⇒
                    {{ behaviourCard.defense - predictedResultsIfAttacked.defenderDamage }}
                </div>
            </div>
            <div v-else-if="canBeSelectedForRepair"
                 @click.stop="selectForRepair(card.id)"
                 class="selectForRepair actionOverlay">
                <div v-if="behaviourCard.paralyzed != predictedResultsIfRepaired.paralyzed"
                     class="selectForRepair-reActivate actionOverlay-predictionText">
                    Re-activate
                </div>
                <div v-if="behaviourCard.damage != predictedResultsIfRepaired.damage"
                     class="actionOverlay-predictedDamageChange actionOverlay-predictionText">
                    {{ behaviourCard.defense - behaviourCard.damage }}
                    ⇒
                    {{ behaviourCard.defense - predictedResultsIfRepaired.damage }}
                </div>
            </div>
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
                 :class="['selectable', {'selectable--turnedAround': !isPlayerCard}]">
                <template v-if="predictedResultsIfTargetForAction">
                    <div v-if="predictedResultsIfTargetForAction.destroyed"
                         class="actionOverlay-predictedLethal actionOverlay-predictionText">
                        ⇒0
                    </div>
                    <div v-else class="actionOverlay-predictedDamageChange actionOverlay-predictionText">
                        {{ behaviourCard.defense - behaviourCard.damage }}
                        ⇒
                        {{ behaviourCard.defense - predictedResultsIfTargetForSacrifice.damage }}
                    </div>
                </template>
            </div>
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
        mapActions: mapCardActions
    } = Vuex.createNamespacedHelpers('card');
    const {
        mapGetters: mapPermissionGetters
    } = Vuex.createNamespacedHelpers('permission');
    const vClickOutside = require('v-click-outside');
    const getCardImageUrl = require("../utils/getCardImageUrl.js")
    const DAMAGE_WHEN_TARGET_FOR_SACRIFICE = 4;

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
                cardWidth: 0,
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
                'attackerCard',
                'repairerCard',
                'canThePlayer'
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
            behaviourCard() {
                return this.createCard(this.card);
            },
            classes() {
                const classes = ['card'];
                if (this.selectedAsAttacker) {
                    classes.push('selectedAsAttacker');
                }
                if (this.isActiveActionCard) {
                    classes.push('isActiveActionCard');
                }
                if (this.isRepairing) {
                    classes.push('isRepairing');
                }
                if (this.card.paralyzed) {
                    classes.push('paralyzed');
                }
                return classes;
            },
            disabled() {
                return this.card.type === 'duration'
                    && !this.canThePlayer.useThisDurationCard(this.card.id);
            },
            cardStyle() {
                const cardUrl = getCardImageUrl.byCommonId(this.card.commonId);
                return {
                    backgroundImage: `url("${cardUrl}")`
                };
            },
            damageTextStyle() {
                const fontSize = Math.round(this.cardWidth * .25);
                return {
                    fontSize: fontSize + 'px'
                }
            },
            disabledOverlayTextStyle() {
                const fontSize = Math.round(this.cardWidth * 1.55);
                return {
                    fontSize: fontSize + 'px'
                };
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
                const card = this.createCard(this.card);
                return card.canBeSacrificed()
                    && (card.canTargetStationCardsForSacrifice() || this.canTargetCardInZoneForSacrifice);
            },
            canAttackSomeCardInSameZone() {
                return this.canAttackCardInZone || this.canAttackStationCards;
            },
            canTargetCardInZoneForSacrifice() { //TODO This should be done on the card that can sacrifice
                const card = this.createCard(this.card);
                return this.zoneOpponentRow
                    .map(cardData => {
                        const isOpponent = !!this.isPlayerCard;
                        return this.createCard(cardData, { isOpponent });
                    })
                    .filter(target => card.canTargetCardForSacrifice(target))
                    .length > 0;
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
                if (!this.isPlayerCard) return false;
                if (!this.repairerCardId) return false;

                return this.createCard(this.card).canBeRepaired();
            },
            isSelectedForAction() {
                return this.selectedCardIdsForAction.includes(this.card.id);
            },
            isRepairing() {
                return this.card.id === this.repairerCardId;
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
            },
            predictedResultsIfAttacked() {
                if (!this.attackerCardId) return null;

                return this.attackerCard.simulateAttackingCard(this.behaviourCard);
            },
            predictedResultsIfRepaired() {
                if (!this.repairerCardId) return null;

                return this.repairerCard.simulateRepairingCard(this.behaviourCard);
            },
            predictedResultsIfTargetForAction() {
                if (!this.activeAction) return null;

                if (this.activeAction.name === 'sacrifice') {
                    return this.predictedResultsIfTargetForSacrifice;
                }
                else if (this.activeAction.name === 'destroyAnyCard') {
                    return this.predictedResultsIfTargetForDestroyAnyCard;
                }
                else {
                    return null;
                }
            },
            predictedResultsIfTargetForSacrifice() {
                const defense = this.behaviourCard.defense;
                const damageAfter = this.behaviourCard.damage + DAMAGE_WHEN_TARGET_FOR_SACRIFICE;
                return {
                    damage: damageAfter,
                    destroyed: defense - damageAfter <= 0
                }
            },
            predictedResultsIfTargetForDestroyAnyCard() {
                return {
                    damage: this.behaviourCard.defense,
                    destroyed: true
                }
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
        mounted() {
            if (!this.$refs.card) {
                throw Error(`Failed to render ZoneCard component with card data: ${JSON.stringify(this.card)}`);
            }
            else {
                this.cardWidth = this.$refs.card.offsetWidth;
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
        transition: transform .1s cubic-bezier(0, 0.07, 0.12, 1.04) !important;
        flex: 0 0 auto;
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

        &--turnedAround {
            transform: rotate(180deg);
        }
    }

    .movable, .repair {
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

    .isRepairing {
        outline: 2px solid rgba(100, 100, 255, 1);
    }

    .actionOverlay-predictionText {
        font-family: "Space mono", monospace;
    }

    .actionOverlay-predictedDamageChange {
        font-size: 1.5em;
    }

    .actionOverlay-predictedLethal {
        font-size: 1.5em;
    }

    .attackble-paralyzed {
        font-size: 1em;
    }

    .selectForRepair-repairDamage {
        font-size: 1.5em;
    }

    .selectForRepair-reActivate {
        font-size: 1em;
    }

    .paralyzed {
        margin-right: 4% !important;
        margin-left: 4% !important;
        transform: rotate(90deg) !important;
        flex: 0 0 auto;

        .field-opponentZoneRows &:first-child {
            margin-right: 4px !important;
        }

        .field-playerZoneRows &:first-child {
            margin-left: 4px !important;
        }

        .field-opponentZoneRows &:last-child {
            margin-left: 4px !important;
        }

        .field-playerZoneRows &:last-child {
            margin-right: 4px !important;
        }
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
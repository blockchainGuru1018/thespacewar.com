<template>
    <div
        :class="['stationCardWrapper', {'stationCardWrapper--fullSize': stationCard.flipped && !isOpponentStationCard}]"
        title="Long press over any card to expand it"
    >
        <div
            v-longpress="cardLongpress"
            :class="classes"
            :style="cardStyle"
        >
            <div
                class="actionOverlays"
                v-if="!isHoldingCard"
            >
                <div
                    @click.stop="putDownCardOrShowChoiceOrAction({ location: 'zone', cardData: stationCard.card })"
                    class="movable moveToZone"
                    v-if="canPlayCard"
                >
                    Play card
                </div>
                <div
                    v-if="canMoveCardToOtherStationRow"
                    @click.stop="startMovingStationCard({stationCard})"
                    class="movable moveToOtherStationRow"
                >
                    Move
                </div>

                <div
                    @click.stop="selectStationCardAsDefender(stationCard)"
                    class="attackable"
                    v-if="canBeSelectedAsDefender"
                />
                <div
                    @click.stop="selectForRepair(stationCard.id)"
                    class="selectForRepair actionOverlay"
                    v-else-if="canBeSelectedForRepair"
                />
                <div
                    @click.stop="selectStationCardForRequirement(stationCard)"
                    class="selectable"
                    v-else-if="canBeSelectedForRequirement"
                />
                <div
                    @click.stop="selectCardForActiveAction(stationCard.id)"
                    class="selectable"
                    v-else-if="canSelectCardForAction"
                />
            </div>
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const getCardImageUrl = require("../utils/getCardImageUrl.js");
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');
    const {
        mapGetters: mapPermissionGetters,
    } = Vuex.createNamespacedHelpers('permission');
    const {
        mapState: mapRequirementState,
        mapActions: mapRequirementActions
    } = Vuex.createNamespacedHelpers('requirement');
    const {
        mapState: mapCardState,
        mapActions: mapCardActions
    } = Vuex.createNamespacedHelpers('card');
    const expandedCardHelpers = Vuex.createNamespacedHelpers('expandedCard');
    const longpress = require('../utils/longpress.js');

    module.exports = {
        props: [
            'stationCard',
            'isOpponentStationCard',
            'isHoldingCard'
        ],
        computed: {
            ...mapState([
                'opponentCardsInZone',
                'attackerCardId',
                'phase',
                'selectedDefendingStationCards',
                'repairerCardId'
            ]),
            ...mapRequirementState([
                'selectedStationCardIdsForRequirement',
            ]),
            ...mapGetters([
                'attackerCanAttackStationCards',
                'actionPoints2',
                'createCard',
                'moveStationCard'
            ]),
            ...mapPermissionGetters([
                'canSelectStationCards',
                'canPutDownStationCardInHomeZone',
                'canSelectCardsForActiveAction'
            ]),
            ...mapCardState([
                'checkIfCanBeSelectedForAction',
                'selectedCardIdsForAction'
            ]),
            classes() {
                const classes = ['stationCard', 'card'];
                if (this.selectedWithDanger) {
                    classes.push('selected--danger');
                }
                if (this.selectedAsDefender) {
                    classes.push('selectedAsDefender');
                }

                if (this.stationCard.flipped) {
                    classes.push('stationCard--flipped', 'card--expandable');
                }
                else {
                    classes.push('card-faceDown');
                }

                return classes;
            },
            cardStyle() {
                if (this.stationCard.flipped) {
                    const cardUrl = getCardImageUrl.byCommonId(this.stationCard.card.commonId);
                    return {
                        backgroundImage: `url(${cardUrl})`
                    }
                }
                return {};
            },
            canPlayCard() {
                return !this.isOpponentStationCard
                    && this.stationCard.flipped
                    && this.actionPoints2 >= this.stationCard.card.cost
                    && this.canPutDownStationCardInHomeZone
                    && this.createCard(this.stationCard.card).canBePlayed();
            },
            canMoveCardToOtherStationRow() {
                if (this.isOpponentStationCard) return false;

                return this.moveStationCard.canMove({
                    cardId: this.stationCard.id,
                    location: `station-${this.stationCard.place}`
                });
            },
            selectedWithDanger() {
                return this.selectedAsDefender
                    || this.selectedForRequirement
                    || this.selectedForAction;
            },
            selectedAsDefender() {
                return this.selectedDefendingStationCards.includes(this.stationCard.id);
            },
            canBeSelectedAsDefender() {
                return !this.selectedAsDefender
                    && !this.stationCard.flipped
                    && this.isOpponentStationCard
                    && this.attackerCardId
                    && this.attackerCanAttackStationCards
                    && !this.opponentCardsInZone.some(c => this.createCard(c).stopsStationAttack());
            },
            canBeSelectedForRepair() {
                if (!this.stationCard.card) return false;
                if (!this.repairerCardId) return false;

                return this.createCard(this.stationCard.card).canBeRepaired();
            },
            selectedForRequirement() {
                return this.selectedStationCardIdsForRequirement.includes(this.stationCard.id);
            },
            canBeSelectedForRequirement() {
                return this.isOpponentStationCard
                    && !this.stationCard.flipped
                    && this.canSelectStationCards
                    && !this.selectedForRequirement;
            },
            selectedForAction() {
                return this.selectedCardIdsForAction.includes(this.stationCard.id);
            },
            canSelectCardForAction() {
                if (!this.canSelectCardsForActiveAction) return false;
                if (this.selectedForAction) return false;

                const options = {
                    cardData: this.stationCard,
                    isStationCard: true,
                    isOpponentCard: this.isOpponentStationCard
                };
                return this.checkIfCanBeSelectedForAction(options);
            }
        },
        methods: {
            ...mapActions([
                'selectStationCardAsDefender',
                'selectForRepair'
            ]),
            ...mapRequirementActions([
                'selectStationCardForRequirement',
            ]),
            ...mapCardActions([
                'selectCardForActiveAction',
                'putDownCardOrShowChoiceOrAction',
                'startMovingStationCard'
            ]),
            ...expandedCardHelpers.mapActions([
                'expandCard'
            ]),
            cardLongpress() {
                if (this.stationCard.flipped) {
                    this.expandCard(this.stationCard.card);
                }
            }
        },
        directives: {
            longpress
        }
    };
</script>
<style lang="scss">
    .card {
        position: relative;
    }
</style>

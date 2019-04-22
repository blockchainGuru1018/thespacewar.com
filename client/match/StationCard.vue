<template>
    <div
            :class="['stationCardWrapper', {'stationCardWrapper--fullSize': stationCard.flipped && !isOpponentStationCard}]"
    >
        <div
                :class="classes"
                :style="cardStyle"
        >
            <div
                    class="actionOverlays"
                    v-if="!isHoldingCard"
            >
                <div
                        @click.stop="putDownCardOrShowChoiceOrAction({ location: 'zone', cardData: stationCard.card })"
                        class="movable"
                        v-if="canMoveCardToZone"
                >
                    Move to zone
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
                        v-else-if="canSelectedCardForAction"
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
                'canPutDownCard'
            ]),
            ...mapPermissionGetters([
                'canSelectStationCards',
                'canMoveStationCards',
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
                    classes.push('stationCard--flipped');
                } else {
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
            canMoveCardToZone() { //TODO Needs to check "canPutDownCard"
                return !this.isOpponentStationCard
                    && this.stationCard.flipped
                    && this.phase === 'action'
                    && this.actionPoints2 >= this.stationCard.card.cost
                    && this.canMoveStationCards
                    && this.canPutDownCard(this.stationCard.card)
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
            canSelectedCardForAction() {
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
                'putDownCardOrShowChoiceOrAction'
            ]),
        }
    };
</script>
<style lang="scss">
    @import "card";

    .card {
        position: relative;
    }
</style>
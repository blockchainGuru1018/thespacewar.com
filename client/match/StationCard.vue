<template>
    <div :style="cardStyle" :class="classes">
        <div class="actionOverlays">
            <div v-if="canMoveCardToZone"
                 @click.stop="startPuttingDownCard({ location: 'zone', cardId: stationCard.id })"
                 class="movable">
                Move to zone
            </div>
            <div v-if="canBeSelectedAsDefender"
                 @click.stop="selectStationCardAsDefender(stationCard)"
                 class="attackable"/>
            <div v-if="canBeSelectedForRequirement"
                 @click.stop="selectStationCardForRequirement(stationCard)"
                 class="selectable"/>
            <div v-if="canSelectedCardForAction"
                 @click.stop="selectCardForActiveAction(stationCard.id)"
                 class="selectable"/>
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const getCardImageUrl = require("../utils/getCardImageUrl.js")
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
            'isOpponentStationCard'
        ],
        computed: {
            ...mapState([
                'opponentCardsInZone',
                'attackerCardId',
                'phase',
                'selectedDefendingStationCards'
            ]),
            ...mapRequirementState([
                'selectedStationCardIdsForRequirement',
            ]),
            ...mapGetters([
                'attackerCanAttackStationCards',
                'actionPoints2',
                'createCard'
            ]),
            ...mapPermissionGetters([
                'canSelectStationCards',
                'canMoveStationCards',
                'canSelectCardsForActiveAction',
            ]),
            ...mapCardState([
                'checkIfCanBeSelectedForAction',
                'selectedCardIdsForAction'
            ]),
            classes() {
                const classes = ['stationCard', 'card'];
                if (this.isOpponentStationCard) {
                    classes.push('card--turnedAround');
                }
                if (this.selectedWithDanger) {
                    classes.push('selected--danger');
                }
                if (this.selectedAsDefender) {
                    classes.push('selectedAsDefender');
                }

                if (this.stationCard.flipped) {
                    classes.push('stationCard--flipped');
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
            canMoveCardToZone() {
                return this.phase === 'action'
                    && this.stationCard.flipped
                    && this.actionPoints2 >= this.stationCard.card.cost
                    && !this.isOpponentStationCard
                    && this.canMoveStationCards;
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
            selectedForRequirement() {
                return this.selectedStationCardIdsForRequirement.includes(this.stationCard.id);
            },
            canBeSelectedForRequirement() {
                return !this.isOpponentStationCard
                    && !this.stationCard.flipped
                    && this.canSelectStationCards;
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
                }
                return this.checkIfCanBeSelectedForAction(options);
            }
        },
        methods: {
            ...mapActions([
                'selectStationCardAsDefender',
            ]),
            ...mapRequirementActions([
                'selectStationCardForRequirement',
            ]),
            ...mapCardActions([
                'selectCardForActiveAction',
                'startPuttingDownCard'
            ]),
        }
    };
</script>
<style scoped lang="scss">
    @import "card";

    .card {
        position: relative;
    }
</style>
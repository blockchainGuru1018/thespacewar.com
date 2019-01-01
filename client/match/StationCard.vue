<template>
    <div v-if="stationCard.flipped" :style="cardStyle" :class="classes">
        <div class="actionOverlays">
            <div v-if="canMoveCardToZone"
                 @click.stop="moveFlippedStationCardToZone(stationCard.id)"
                 class="movable">
                Move to zone
            </div>
        </div>
    </div>
    <div v-else-if="selectedWithDanger" :class="classes"/>
    <div v-else :class="classes">
        <div class="actionOverlays">
            <div v-if="canBeSelectedAsDefender"
                 @click.stop="selectStationCardAsDefender(stationCard)"
                 class="attackable"/>
            <div v-if="canBeSelectedForRequirement"
                 @click.stop="selectStationCardForRequirement(stationCard)"
                 class="selectable"/>
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');
    const {
        mapState: mapPermissionState,
        mapGetters: mapPermissionGetters,
        mapMutations: mapPermissionMutations,
        mapActions: mapPermissionActions
    } = Vuex.createNamespacedHelpers('permission');
    const {
        mapState: mapRequirementState,
        mapGetters: mapRequirementGetters,
        mapMutations: mapRequirementMutations,
        mapActions: mapRequirementActions
    } = Vuex.createNamespacedHelpers('requirement');

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
                'canMoveStationCards'
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
                return {
                    backgroundImage: 'url(/card/' + this.stationCard.card.commonId + '/image)'
                }
            },
            canMoveCardToZone() {
                return this.phase === 'action'
                    && this.actionPoints2 >= this.stationCard.card.cost
                    && !this.isOpponentStationCard
                    && this.canMoveStationCards;
            },
            selectedWithDanger() {
                return this.selectedAsDefender
                    || this.selectedForRequirement;
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
            }
        },
        methods: {
            ...mapActions([
                'selectStationCardAsDefender',
                'moveFlippedStationCardToZone'
            ]),
            ...mapRequirementActions([
                'selectStationCardForRequirement',
            ])
        }
    };
</script>
<style scoped lang="scss">
    @import "card";

    .card {
        position: relative;
    }
</style>
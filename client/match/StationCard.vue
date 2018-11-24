<template>
    <div v-if="stationCard.flipped" :style="cardStyle" class="card">
        <div class="actionOverlays">
            <div
                    v-if="canMoveCardToZone"
                    @click.stop="moveFlippedStationCardToZone(stationCard.id)"
                    class="movable">
                Move to zone
            </div>
        </div>
    </div>
    <div v-else-if="selectedAsDefender" class="card card-faceDown selectedAsDefender"/>
    <div v-else-if="canBeSelectedAsDefender" class="card card-faceDown">
        <div class="actionOverlays">
            <div @click.stop="selectStationCardAsDefender(stationCard)" class="attackable"/>
        </div>
    </div>
    <div v-else class="card card-faceDown"/>
</template>
<script>
    const Vuex = require('vuex');
    const { mapState, mapGetters, mapActions } = Vuex.createNamespacedHelpers('match');

    module.exports = {
        props: [
            'stationCard',
            'isOpponentStationCard'
        ],
        computed: {
            ...mapState([
                'attackerCardId',
                'phase',
                'selectedDefendingStationCards'
            ]),
            ...mapGetters([
                'attackerCanAttackStationCards',
                'actionPoints2'
            ]),
            canMoveCardToZone() {
                return this.phase === 'action'
                    && this.actionPoints2 >= this.stationCard.card.cost;
            },
            cardStyle() {
                return {
                    backgroundImage: 'url(/card/' + this.stationCard.card.commonId + '/image)'
                }
            },
            selectedAsDefender() {
                return this.selectedDefendingStationCards.includes(this.stationCard.id);
            },
            canBeSelectedAsDefender() {
                return !this.selectedAsDefender
                    && !this.stationCard.flipped
                    && this.isOpponentStationCard
                    && this.attackerCardId
                    && this.attackerCanAttackStationCards;
            }
        },
        methods: {
            ...mapActions([
                'selectStationCardAsDefender',
                'moveFlippedStationCardToZone'
            ])
        }
    };
</script>
<style scoped lang="scss">
    .card {
        position: relative;
    }

    .actionOverlays {
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

    .attackable, .movable {
        color: white;
        font-family: Helvetica, sans-serif;
        font-size: 16px;
        flex: 1 1;
        display: flex;
        align-items: center;
        justify-content: center;
        visibility: hidden;
        text-align: center;
        opacity: .5;
        cursor: pointer;

        &:hover {
            opacity: 1;
        }
    }

    .attackable {
        background-color: rgba(255, 100, 100, .5);
    }

    .movable {
        background-color: rgba(0, 0, 0, .2);
    }

    .actionOverlays:hover {
        & .movable, & .attackable {
            visibility: visible;
        }
    }

    .card.card-faceDown.selectedAsDefender {
        outline: 3px solid red;
    }
</style>
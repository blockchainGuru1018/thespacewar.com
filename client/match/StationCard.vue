<template>
    <div v-if="stationCard.flipped" :style="cardStyle" class="card"/>
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
            ]),
            ...mapGetters([
                'attackerCanAttackStationCards'
            ]),
            cardStyle() {
                return {
                    backgroundImage: 'url(/card/' + this.stationCard.card.commonId + '/image)'
                }
            },
            canBeSelectedAsDefender() {
                console.log('this.isOpponentStationCard', this.isOpponentStationCard, !!this.attackerCardId, this.attackerCanAttackStationCards)
                return this.isOpponentStationCard
                    && this.attackerCardId
                    && this.attackerCanAttackStationCards;
            }
        },
        methods: {
            ...mapActions([
                'selectStationCardAsDefender'
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

    .attackable {
        background-color: rgba(255, 100, 100, .5);
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

    .actionOverlays:hover {
        & .movable, & .readyToAttack, & .attackable {
            visibility: visible;
        }
    }
</style>
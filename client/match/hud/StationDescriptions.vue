<template>
    <div>
        <portal to="stationDrawRow">
            <span class="stationRowDescription descriptionText">
                {{ drawRowText }}
            </span>
        </portal>
        <portal to="stationActionRow">
            <span class="stationRowDescription descriptionText">
                {{ actionRowText }}
            </span>
        </portal>
        <portal to="stationHandSizeRow">
            <span class="stationRowDescription descriptionText">
                {{ handSizeRowText }}
            </span>
        </portal>
    </div>
</template>

<script>
    const Vuex = require('vuex');
    const matchHelpers = Vuex.createNamespacedHelpers('match');

    export default {
        name: 'StationDescriptions',
        computed: {
            ...matchHelpers.mapGetters([
                'cardsToDrawInDrawPhase',
                'actionPointsFromStationCards',
                'maxHandSize',
            ]),
            drawRowText() {
                const cardsToDrawInDrawPhase = this.cardsToDrawInDrawPhase;
                return `Draw ${cardsToDrawInDrawPhase} card${cardsToDrawInDrawPhase === 1 ? '' : 's'} each turn`
            },
            actionRowText() {
                const actionPoints = this.actionPointsFromStationCards;
                return `Start turn with ${actionPoints} action point${actionPoints === 1 ? '' : 's'}`;
            },
            handSizeRowText() {
                const maxHandSize = this.maxHandSize;
                return `Max ${maxHandSize} card${maxHandSize === 1 ? '' : 's'} on hand`
            }
        }
    };
</script>

<style lang="scss" scoped>
    @import "guiDescription";
</style>

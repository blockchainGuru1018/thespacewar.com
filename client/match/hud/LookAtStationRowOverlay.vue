<template>
    <div>
        <portal
            to="stationCard-actionOverlays--handSizeRow"
            target-class="actionOverlay--normal"
        >
            <div
                v-if="lookAtHandSizeStationRowOverlayVisible"
                @click="lookAtHandSizeStationRow"
                class="lookAtStationRowOverlay"
                title="Look at all cards in station row"
            >
                Look at
            </div>
        </portal>
    </div>
</template>

<script>
    import featureToggles from "../../utils/featureToggles.js";

    const Vuex = require('vuex');
    const matchHelpers = Vuex.createNamespacedHelpers('match');
    const requirementHelpers = Vuex.createNamespacedHelpers('requirement');

    export default {
        name: 'LookAtStationRowOverlay',
        computed: {
            ...matchHelpers.mapGetters([
                'lookAtStationRow',
            ]),
            lookAtHandSizeStationRowOverlayVisible() {
                return this.lookAtStationRow.canDoIt();
            }
        },
        methods: {
            ...requirementHelpers.mapActions([
                'lookAtHandSizeStationRow'
            ])
        }
    };
</script>

<style lang="scss">
    .lookAtStationRowOverlay {
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
    }
</style>

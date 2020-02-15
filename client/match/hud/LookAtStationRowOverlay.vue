<template>
    <div v-if="featureOn">
        <portal to="stationHandSizeRow">
            <div
                v-if="lookAtHandSizeStationRowOverlayVisible"
                @click="lookAtHandSizeStationRow"
                class="lookAtStationRowOverlay"
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
        data() {
            return {
                featureOn: featureToggles.isEnabled('lookAtStationRow')
            };
        },
        computed: {
            ...matchHelpers.mapGetters([
                'cardsThatCanLookAtHandSizeStationRow',
            ]),
            lookAtHandSizeStationRowOverlayVisible() {
                return this.cardsThatCanLookAtHandSizeStationRow.length;
            }
        },
        methods: {
            ...requirementHelpers.mapActions([
                'lookAtHandSizeStationRow'
            ])
        }
    };
</script>

<style lang="scss" scoped>
    .lookAtStationRowOverlay {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        background: rgba(100, 255, 100, .25);
    }
</style>

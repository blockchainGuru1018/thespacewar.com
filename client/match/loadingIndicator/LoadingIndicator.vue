<template>
    <div>
        <portal to="match">
            <div v-if="visible" class="loadingBlock"/>
        </portal>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const {
        mapState: mapLoadingIndicatorState,
        mapGetters: mapLoadingIndicatorGetters,
        mapMutations: mapLoadingIndicatorMutations,
        mapActions: mapLoadingIndicatorActions
    } = Vuex.createNamespacedHelpers('loadingIndicator');

    module.exports = {
        computed: {
            ...mapLoadingIndicatorState([
                'visible',
            ])
        }
    }
</script>
<style scoped lang="scss">
    .loadingBlock {
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background-color: transparent;
        z-index: 9999;
    }
</style>
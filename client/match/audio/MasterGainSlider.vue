<template>
    <FactorSlider
        :value="masterGain"
        @input="setMasterGain"
    />
</template>
<script>
    const Vuex = require('vuex');
    const audioHelpers = Vuex.createNamespacedHelpers('audio');
    const resolveModule = require('../../utils/resolveModuleWithPossibleDefault.js');
    const FactorSlider = resolveModule(require('../../miscComponents/FactorSlider.vue'));

    module.exports = {
        computed: {
            ...audioHelpers.mapState([
                'masterGain'
            ])
        },
        methods: {
            ...audioHelpers.mapActions([
                'setMasterGain'
            ])
        },
        components: {
            FactorSlider
        }
    }
</script>
<style>

</style>

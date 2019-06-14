<template>
    <CommanderCards
        v-if="opponentCommanders.length"
        :commanders="opponentCommanders"
        :turnedAround="true"
    />
</template>
<script>
    const Vuex = require('vuex');
    const matchHelpers = Vuex.createNamespacedHelpers('match');
    const resolveModule = require('../../utils/resolveModuleWithPossibleDefault.js');
    const CommanderCards = resolveModule(require('./CommanderCards.vue'));

    module.exports = {
        computed: {
            ...matchHelpers.mapState([
                'opponentCommanders'
            ])
        },
        components: {
            CommanderCards
        }
    }
</script>

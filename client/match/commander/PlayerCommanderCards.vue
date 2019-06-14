<template>
    <CommanderCards
        v-if="commanderCardsVisible"
        :commanders="commanders"
    />
</template>
<script>
    const Vuex = require('vuex');
    const matchHelpers = Vuex.createNamespacedHelpers('match');
    const startGameHelpers = Vuex.createNamespacedHelpers('startGame');
    const resolveModule = require('../../utils/resolveModuleWithPossibleDefault.js');
    const CommanderCards = resolveModule(require('./CommanderCards.vue'));

    module.exports = {
        computed: {
            ...matchHelpers.mapState([
                'commanders'
            ]),
            ...startGameHelpers.mapGetters([
                'commanderCardsVisible'
            ])
        },
        components: {
            CommanderCards
        }
    }
</script>

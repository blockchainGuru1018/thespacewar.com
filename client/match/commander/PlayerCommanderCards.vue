<template>
    <CommanderCards
        v-if="commanderCardsVisible"
        :commanders="commanders"
        @click.native="commanderCardsClick"
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
            ...matchHelpers.mapGetters([
                'selectingStartingStationCards'
            ]),
            ...startGameHelpers.mapGetters([
                'commanderCardsVisible'
            ]),
            commanderSelectionHidden: {
                get() {
                    return this.$store.state.startGame.commanderSelectionHidden;
                },
                set(value) {
                    return this.$store.state.startGame.commanderSelectionHidden = value;
                }
            }
        },
        methods: {
            commanderCardsClick() {
                if (this.selectingStartingStationCards) {
                    this.commanderSelectionHidden = false;
                }
            }
        },
        components: {
            CommanderCards
        }
    }
</script>

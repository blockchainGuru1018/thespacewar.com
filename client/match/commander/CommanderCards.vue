<template>
    <div
        v-if="!commanderSelectionVisible"
        class="commanderCards"
    >
        <CommanderCard
            v-for="commander in commanders"
            :key="commander"
        >
            {{ commanderValueToName[commander] }}
        </CommanderCard>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const matchHelpers = Vuex.createNamespacedHelpers('match');
    const startGameHelpers = Vuex.createNamespacedHelpers('startGame');
    const resolveModule = require('../../utils/resolveModuleWithPossibleDefault.js');
    const CommanderCard = resolveModule(require('./CommanderCard.vue'));
    const Commander = require('../../../shared/match/commander/Commander.js');

    const commanderValueToName = {
        [Commander.FrankJohnson]: 'Frank Johnson',
        [Commander.TheMiller]: 'The Miller',
        [Commander.DrStein]: 'Dr.Stein',
        [Commander.GeneralJackson]: 'General Jackson',
        [Commander.KeveBakins]: 'Keve Bakins',
        [Commander.NiciaSatu]: 'Nicia Satu',
    };

    module.exports = {
        data() {
            return {
                commanderValueToName
            };
        },
        computed: {
            ...matchHelpers.mapState([
                'commanders'
            ]),
            ...startGameHelpers.mapGetters([
                'commanderSelectionVisible'
            ])
        },
        components: {
            CommanderCard
        }
    }
</script>
<style lang="scss">
    .commanderCards {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>

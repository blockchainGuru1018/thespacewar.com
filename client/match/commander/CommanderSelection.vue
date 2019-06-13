<template>
    <div v-if="commanderSelectionVisible" class="commanderSelection">
        <CommanderCard
            v-for="commander in commanderOptions"
            :key="commander.value"
            :selected="selectedCommander === commander.value"
            @select="selectedCommander = commander.value"
        >
            {{ commander.name }}
        </CommanderCard>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const startGameHelpers = Vuex.createNamespacedHelpers('startGame');
    const resolveModule = require('../../utils/resolveModuleWithPossibleDefault.js');
    const CommanderCard = resolveModule(require('./CommanderCard.vue'));
    const Commander = require('../../../shared/match/commander/Commander.js');

    const commanderOptions = [
        { name: 'General Jackson', value: Commander.GeneralJackson },
        { name: 'The Miller', value: Commander.TheMiller },
        { name: 'Dr.Stein', value: Commander.DrStein },
        { name: 'Keve Bakins', value: Commander.KeveBakins },
        { name: 'Frank Johnson', value: Commander.FrankJohnson },
        { name: 'Nicia Satu', value: Commander.NiciaSatu }
    ];

    module.exports = {
        data() {
            return {
                commanderOptions
            };
        },
        computed: {
            ...startGameHelpers.mapGetters([
                'commanderSelectionVisible',
            ]),
            selectedCommander: {
                get() {
                    return this.$store.state.match.commanders[0];
                },
                set(value) {
                    this.$store.dispatch('startGame/selectCommander', value);
                }
            }
        },
        components: {
            CommanderCard
        }
    }
</script>
<style lang="scss">
    .commanderSelection {
        position: absolute;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 300px;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .commanderSelection .commanderCard {
        &:hover {
            transform: scale(1.05);
            box-shadow: 0px 0px 150px 10px #000;
            transition: all 0.2s ease;
            cursor: pointer;
            z-index: 2;
        }
    }

    .commanderSelection .commanderCard--selected {
        border: 3px solid green;
    }
</style>

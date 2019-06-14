<template>
    <div
        v-if="commanderSelectionVisible"
        class="commanderSelection"
    >
        <div class="commanderSelection-header">
            <div class="commanderSelection-headerText">
                Select your commander
            </div>
            <button class="commanderSelection-hide darkButton--onlyLook" @click="hidden = !hidden">
                {{ hidden ? 'Show' : 'Hide' }}
            </button>
        </div>
        <div v-if="!hidden" class="commanderSelection-cards">
            <div
                v-for="(row, index) in rows"
                :key="index"
                class="commanderSelection-cardsRow"
            >
                <CommanderCard
                    v-for="commander in row.commanderOptions"
                    :key="commander.value"
                    :commander="commander.value"
                    :selected="selectedCommander === commander.value"
                    @select="selectedCommander = commander.value"
                >
                    {{ commander.name }}
                </CommanderCard>
            </div>
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const startGameHelpers = Vuex.createNamespacedHelpers('startGame');
    const resolveModule = require('../../utils/resolveModuleWithPossibleDefault.js');
    const CommanderCard = resolveModule(require('./CommanderCard.vue'));
    const Commander = require('../../../shared/match/commander/Commander.js');

    const commanderOptions = [
        { name: 'Frank Johnson', value: Commander.FrankJohnson },
        { name: 'Keve Bakins', value: Commander.KeveBakins },
        { name: 'Nicia Satu', value: Commander.NiciaSatu },
        { name: 'General Jackson', value: Commander.GeneralJackson },
        { name: 'Dr.Stein', value: Commander.DrStein },
        { name: 'The Miller', value: Commander.TheMiller }
    ];

    module.exports = {
        data() {
            return {
                hidden: false,
                rows: [
                    { commanderOptions: commanderOptions.slice(0, 3) },
                    { commanderOptions: commanderOptions.slice(3) }
                ]
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
    @import "../cardVariables";

    .commanderSelection {
        position: absolute;
        z-index: 4;
        top: 5%;
        left: 50%;
        transform: translateX(-50%);

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .commanderSelection-header {
        line-height: 100%;
        font-size: 48px;
        color: white;
        font-weight: bold;
        font-family: "Space mono", sans-serif;
        margin-bottom: 20px;

        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }

    .commanderSelection-headerText {
        flex: 0 0 auto;
    }

    button.commanderSelection-hide {
        padding: 10px 20px;
        margin: 0 20px;
    }

    .commanderSelection-cards {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .commanderSelection-cardsRow {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .commanderSelection .commanderCard {
        width: $commanderCardWidth;
        height: $commanderCardHeight;
        margin: 10px 50px;

        &:hover {
            transform: scale(1.6);
            box-shadow: 0px 0px 150px 10px #000;
            transition: all 0.2s ease;
            cursor: pointer;
            z-index: 2;
        }
    }

    .commanderSelection .commanderCard--selected {
        &::after {
            content: "↓";
            position: absolute;
            transform: translateX(-50%);
            bottom: 93%;
            left: 50%;

            font-size: 36px;
            color: white;
            font-weight: bold;
            font-family: "Space mono", sans-serif;
            text-shadow: #000 0 0;
        }

        &:hover::after {
            font-size: 40px;
        }
    }

    .commanderSelection .commanderCard:not(.commanderCard--selected):hover::after {
        content: "↓";
        position: absolute;
        transform: translateX(-50%);
        bottom: 93%;
        left: 50%;

        font-size: 40px;
        color: transparent;
        font-weight: bold;
        font-family: "Space mono", sans-serif;

        text-shadow: #000 0 0;
    }

    * {

        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
</style>

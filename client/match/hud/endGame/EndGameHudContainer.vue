<template>
    <portal to="match">
        <EndGameHud
            :hasLostGame="playerRetreated"
            :hasWonGame="opponentRetreated"
            :showEndGameScreen="showEndGameScreen"
            @endGame="endGame"
        />
    </portal>
</template>
<script>
    import Vuex from 'vuex';
    import EndGameHud from "./EndGameHud.vue";

    const matchHelpers = Vuex.createNamespacedHelpers('match');

    export default {
        name: 'EndGameHudContainer',
        components: { EndGameHud },
        data() {
            return {
                showEndGameScreen: false
            };
        },
        computed: {
            ...matchHelpers.mapGetters([
                'playerRetreated',
                'opponentRetreated'
            ]),
            gameHasEnded() {
                return this.opponentRetreated || this.playerRetreated;
            }
        },
        watch: {
            gameHasEnded: {
                immediate: true,
                handler() {
                    if (this.gameHasEnded) {
                        setTimeout(() => {
                            this.showEndGameScreen = true;
                        }, 2200);
                    }
                }
            }
        },
        methods: {
            ...matchHelpers.mapActions([
                'endGame'
            ])
        }
    }
</script>


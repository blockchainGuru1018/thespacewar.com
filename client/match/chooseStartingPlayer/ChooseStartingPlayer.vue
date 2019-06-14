<template>
    <div
        v-if="visible"
        class="chooseStartingPlayer"
    >
        <div class="chooseStartingPlayer-dialog cardChoiceDialog">
            <div class="chardChoiceDialog-header">
                <span class="chooseStartingPlayer-randomlyChosenText">
                    You were randomly chosen to
                </span>
                Select the starting player
            </div>
            <button
                v-for="player in players"
                :key="player.id"
                class="cardChoiceDialog-choice"
                @click="selectPlayerToStart(player.id)"
            >
                {{ player.name }}
            </button>
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const chooseStartingPlayerHelpers = Vuex.createNamespacedHelpers('chooseStartingPlayer');

    module.exports = {
        computed: {
            ...chooseStartingPlayerHelpers.mapGetters([
                'players',
                'visible'
            ])
        },
        methods: {
            ...chooseStartingPlayerHelpers.mapActions([
                'selectPlayerToStart'
            ])
        }
    };
</script>
<style lang="scss">
    @import "chooseStartingPlayer";
</style>

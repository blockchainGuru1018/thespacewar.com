<template>
    <div
        v-if="visible"
        class="chooseStartingPlayer"
    >
        <div class="chooseStartingPlayer-dialog cardChoiceDialog">
            <div class="chardChoiceDialog-header">
                Choose starting player
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
<style scoped lang="scss">
    .chooseStartingPlayer {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
    }

    .chooseStartingPlayer-dialog {
        border: 1px solid rgba(255, 255, 255, 0.15);
    }
</style>

<template>
    <div
        v-if="visible"
        class="chooseStartingPlayer"
    >
        <div class="cardChoiceDialog-overlay" />
        <div
            class="cardChoiceDialog"
        >
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

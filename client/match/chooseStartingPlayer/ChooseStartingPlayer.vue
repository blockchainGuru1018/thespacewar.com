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
                class="cardChoiceDialog-choice"
                @click="selectPlayerToStart(player.id)"
            >
                You
            </button>
            <button
                class="cardChoiceDialog-choice"
                @click="selectPlayerToStart(opponent.id)"
            >
                {{ opponent.name }}
                <span class="cardChoiceDialog-choiceSubText">
                    You start with +1 card on hand
                </span>
                <span class="cardChoiceDialog-choiceSubText">
                    and +1 station card
                </span>
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
                'player',
                'opponent',
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

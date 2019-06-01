<template>
    <div class="match-header">
        <button
            class="match-menuButton match-smallButton"
            @click="showEscapeMenu"
        >
            Menu
        </button>
        <h1 :title="`Match ID: ${matchId}`">
            {{ ownUser.name }} v.s. {{ opponentUser.name }}
        </h1>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const matchHelpers = Vuex.createNamespacedHelpers('match');
    const escapeMenuHelpers = Vuex.createNamespacedHelpers('escapeMenu');

    module.exports = {
        computed: {
            ...matchHelpers.mapState([
                'matchId',
                'opponentUser',
                'ownUser'
            ])
        },
        methods: {
            ...escapeMenuHelpers.mapActions({
                showEscapeMenu: 'show'
            })
        }
    }
</script>
<style scoped>

</style>

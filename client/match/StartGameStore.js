module.exports = function ({
    matchController
}) {

    return {
        namespaced: true,
        name: 'startGame',
        state: {
            localPlayerHasRegisteredAsReady: false
        },
        getters: {
            playerHasRegisteredAsReady,
            readyButtonVisible,
            commanderSelectionVisible
        },
        actions: {
            playerReady,
            selectCommander
        }
    };

    function playerHasRegisteredAsReady(state, getters, rootState) {
        return state.localPlayerHasRegisteredAsReady
            || rootState.match.readyPlayerIds.includes(rootState.match.ownUser.id);
    }

    function readyButtonVisible(state, getters, rootState, rootGetters) {
        return rootGetters['match/startingStationCardsToPutDownCount'] === 0
            && !getters.playerHasRegisteredAsReady;
    }

    function commanderSelectionVisible(state, getters) {
        return !getters.playerHasRegisteredAsReady;
    }

    function playerReady({ state }) {
        state.localPlayerHasRegisteredAsReady = true;
        matchController.emit('playerReady');
    }

    function selectCommander({ rootState }, commander) {
        rootState.match.commanders = [commander]; //TODO This should not change state of another store directly. Implement a commit or something!
        matchController.emit('selectCommander', { commander }); //TODO This could potentially lead to some lag weird visual behaviour if you quickly select different commanders (as the server would bounce back many results)
    }
};

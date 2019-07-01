module.exports = function ({
    matchController
}) {

    return {
        namespaced: true,
        name: 'startGame',
        state: {
            localPlayerHasRegisteredAsReady: false,
            commanderSelectionHidden: false
        },
        getters: {
            playerHasRegisteredAsReady,
            commanderCardsVisible,
            canSelectCommander,
            readyButtonVisible,
            _doneSelectingStationCards
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

    function commanderCardsVisible(state, getters) {
        return getters._doneSelectingStationCards;
    }

    function canSelectCommander(state, getters) {
        return getters._doneSelectingStationCards
            && !getters.playerHasRegisteredAsReady;
    }

    function readyButtonVisible(state, getters, rootState) {
        const hasSelectedCommander = !!rootState.match.commanders[0];
        return hasSelectedCommander
            && !getters.playerHasRegisteredAsReady;
    }

    function _doneSelectingStationCards(state, getters, rootState, rootGetters) {
        return rootGetters['match/gameOn']
            || rootGetters['match/startingStationCardsToPutDownCount'] === 0;
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

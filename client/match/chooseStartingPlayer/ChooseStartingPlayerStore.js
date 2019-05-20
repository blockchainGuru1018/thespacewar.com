const MatchMode = require("../../../shared/match/MatchMode.js");

module.exports = function ({
    matchController
}) {

    return {
        name: 'chooseStartingPlayer',
        namespaced: true,
        state: {},
        getters: {
            visible,
            players
        },
        actions: {
            selectPlayerToStart
        }
    };

    function visible(state, getters, rootState) {
        return rootState.match.mode === MatchMode.chooseStartingPlayer
            && rootState.match.currentPlayer === rootState.match.ownUser.id;
    }

    function players(state, getters, rootState) {
        const ownUser = rootState.match.ownUser;
        const opponentUser = rootState.match.opponentUser;
        return [
            { id: ownUser.id, name: ownUser.name },
            { id: opponentUser.id, name: opponentUser.name }
        ];
    }

    function selectPlayerToStart(actionContext, playerToStartId) {
        matchController.emit('selectPlayerToStart', { playerToStartId });
    }
};

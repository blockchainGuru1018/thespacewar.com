const ajax = require('../utils/ajax.js');
const localGameDataFacade = require("../utils/localGameDataFacade.js")

module.exports = function ({
    route,
    rootStore,
    userRepository
}) {

    return {
        namespaced: true,
        name: 'login',
        state: {
            username: ''
        },
        getters: {
            checkIfHasPreviousSession
        },
        actions: {
            login,
            restoreFromPreviousSession
        }
    };

    async function login({ state, dispatch }) {
        let ownUser = await ajax.jsonPost('/login', { name: state.username });
        localGameDataFacade.setOwnUser(ownUser);
        dispatch('user/storeOwnUser', ownUser, { root: true });
    }

    function checkIfHasPreviousSession() {
        return () => !!localGameDataFacade.getOngoingMatch();
    }

    async function restoreFromPreviousSession() {
        const matchData = localGameDataFacade.getOngoingMatch();
        if (matchData) {
            await joinMatch(matchData);
        }
    }

    async function joinMatch({ id: matchId, playerIds }) {
        let ownUserId = userRepository.getOwnUser().id;
        let opponentUserId = playerIds.find(id => id !== ownUserId);
        let users = userRepository.getAllLocal();
        let opponentUser = users.find(u => u.id === opponentUserId);
        route('match', { matchId, opponentUser });
    }
}
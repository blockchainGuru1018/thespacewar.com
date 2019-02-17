const ajax = require('../utils/ajax.js');

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
        localStorage.setItem('own-user', JSON.stringify(ownUser));
        dispatch('user/storeOwnUser', ownUser, { root: true });
    }

    function checkIfHasPreviousSession() {
        return () => !!localStorage.getItem('ongoing-match');
    }

    async function restoreFromPreviousSession() {
        const ongoingMatchJson = localStorage.getItem('ongoing-match');
        if (ongoingMatchJson) {
            const matchData = JSON.parse(ongoingMatchJson);
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
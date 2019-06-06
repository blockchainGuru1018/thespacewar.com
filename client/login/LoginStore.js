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
            username: '',
            enteredWrongAccessKey: false,
            hasAccess: false
        },
        getters: {
            checkIfHasPreviousSession
        },
        actions: {
            init,
            login,
            testAccessKey,
            restoreFromPreviousSession
        }
    };

    function init({ state, dispatch }) {
        const storedAccessKey = localGameDataFacade.AccessKey.get();
        if (storedAccessKey) {
            state.hasAccess = true;
            dispatch('testAccessKey', storedAccessKey);
        }
    }

    async function login({ state, dispatch }) {
        let ownUser = await ajax.jsonPost('/login', { name: state.username });
        localGameDataFacade.setOwnUser(ownUser);
        dispatch('user/storeOwnUser', ownUser, { root: true });
    }

    async function testAccessKey({ state }, key) {
        try {
            const result = await ajax.jsonPost('/test-access-key', { key });
            if (result.valid) {
                state.enteredWrongAccessKey = false;
                state.hasAccess = true;
                localGameDataFacade.AccessKey.set(key);
            }
            else {
                state.hasAccess = false;
                state.enteredWrongAccessKey = true;
                localGameDataFacade.AccessKey.remove();
            }
        }
        catch (error) {
            state.enteredWrongAccessKey = true;
        }
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
};

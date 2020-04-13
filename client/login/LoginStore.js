const ajax = require('../utils/ajax.js');
const localGameDataFacade = require("../utils/localGameDataFacade.js")
const createBotUser = require('../../shared/user/createBotUser.js');
const BotId = 'BOT';

module.exports = function ({
    route,
    userRepository,
    botUpdateListener
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

    async function init({ state, dispatch }) {
        const config = await ajax.get('/config');
        if (!config.USE_ACCESS_KEY) {
            localStorage.setItem('access-key', '"testing123"')
        }
        const storedAccessKey = localGameDataFacade.AccessKey.get();
        if (storedAccessKey) {
            state.hasAccess = true;
            dispatch('testAccessKey', storedAccessKey);
        }
    }

    async function login({ state, dispatch }) {
        const ownUser = await ajax.jsonPost('/login', { name: state.username });
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
            const { id: matchId, playerIds } = matchData;
            if (playerIds.includes(BotId)) {
                joinBotMatch(matchId);
            }
            else {
                joinPlayerMatch(matchId, playerIds);
            }
        }
    }

    function joinBotMatch(matchId) {
        const botUser = createBotUser();
        route('match', { matchId, opponentUser: botUser });

        botUpdateListener.start({ matchId, botUser, playerUser: userRepository.getOwnUser() });

        userRepository.reconnectBot();
    }

    function joinPlayerMatch(matchId, playerIds) {
        const ownUserId = userRepository.getOwnUser().id;
        const opponentUserId = playerIds.find(id => id !== ownUserId);
        const users = userRepository.getAllLocal();
        const opponentUser = users.find(u => u.id === opponentUserId);
        route('match', { matchId, opponentUser });
    }
};

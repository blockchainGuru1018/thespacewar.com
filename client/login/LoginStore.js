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
            checkIfHasPreviousSession,
            checkIfLoggedInAsGuest
        },
        actions: {
            init,
            login,
            loginAsGuest,
            testAccessKey,
            restoreFromPreviousSession,
            authenticateUserSession,
            _resetLocallyStoredUserData,
            _restorePreviousSession,
            _reinitializeUserSession,
            _loadOwnUser
        }
    };

    async function init({state, dispatch}) {
        const storedAccessKey = localGameDataFacade.AccessKey.get();
        if (storedAccessKey) {
            state.hasAccess = true;
            dispatch('testAccessKey', storedAccessKey);
        }
    }

    async function login({dispatch}) {
        const ownUser = await ajax.jsonPostEmptyWithSecret('/login');
        localGameDataFacade.setOwnUser(ownUser);
        dispatch('user/storeOwnUser', ownUser, {root: true});
    }

    async function loginAsGuest({dispatch}) {
        const newRandomName = `Guest${Math.round(Math.random() * 9999)}`;
        const ownUser = await ajax.jsonPost('/guest-login', {name: newRandomName});
        localGameDataFacade.setOwnUser(ownUser);
        dispatch('user/storeOwnUser', ownUser, {root: true});
    }

    async function authenticateUserSession({dispatch, getters, rootGetters}) {
        const loggedInToHome = await isLoggedInToHome();
        if (!loggedInToHome) {
            const checkIfLoggedInAsGuest = rootGetters['login/checkIfLoggedInAsGuest']
            const isLoggedInAsGuest = await checkIfLoggedInAsGuest();
            if (!isLoggedInAsGuest) {
                dispatch('_resetLocallyStoredUserData');
            }
        } else if (await isLoggedInToGame()) {
            if (getters['checkIfHasPreviousSession']) {
                dispatch('_restorePreviousSession');
            }
        } else {
            dispatch('_reinitializeUserSession');
        }
    }

    async function isLoggedInToHome() {
        const {isLoggedIn} = await ajax.get('/is-logged-in-to-home');
        return isLoggedIn;
    }

    async function isLoggedInToGame() {
        return !!localGameDataFacade.getOwnUser()
            && await existsOnServer();
    }

    async function existsOnServer() {
        const ownUser = localGameDataFacade.getOwnUser();
        const allUsers = await userRepository.getAll();
        return allUsers.some(u => u.id === ownUser.id);
    }

    async function _restorePreviousSession({dispatch}) {
        dispatch('_loadOwnUser');
        await dispatch('login/restoreFromPreviousSession', null, {root: true});
    }

    function _loadOwnUser({dispatch}) {
        const ownUser = localGameDataFacade.getOwnUser();
        if (ownUser) {
            dispatch('user/storeOwnUser', ownUser, {root: true});
        }
    }

    function _reinitializeUserSession({dispatch}) {
        dispatch('_resetLocallyStoredUserData');
        dispatch('login');
    }

    function _resetLocallyStoredUserData({dispatch}) {
        localGameDataFacade.removeAll();
        dispatch('user/storeOwnUser', null, {root: true});
    }

    async function testAccessKey({state}, key) {
        try {
            const result = await ajax.jsonPost('/test-access-key', {key});
            if (result.valid) {
                state.enteredWrongAccessKey = false;
                state.hasAccess = true;
                localGameDataFacade.AccessKey.set(key);
            } else {
                state.hasAccess = false;
                state.enteredWrongAccessKey = true;
                localGameDataFacade.AccessKey.remove();
            }
        } catch (error) {
            state.enteredWrongAccessKey = true;
        }
    }

    function checkIfHasPreviousSession() {
        return () => !!localGameDataFacade.getOngoingMatch();
    }

    function checkIfLoggedInAsGuest() {
        return loggedInAsGuest;
    }

    async function loggedInAsGuest() {
        const [
            loggedInHome,
            loggedInGame
        ] = await Promise.all([
            isLoggedInToHome(),
            isLoggedInToGame()
        ]);
        return !loggedInHome && loggedInGame;
    }

    async function restoreFromPreviousSession() {
        const matchData = localGameDataFacade.getOngoingMatch();
        if (matchData) {
            const {id: matchId, playerIds} = matchData;
            if (playerIds.includes(BotId)) {
                joinBotMatch(matchId);
            } else {
                joinPlayerMatch(matchId, playerIds);
            }
        }
    }

    function joinBotMatch(matchId) {
        const botUser = createBotUser();
        route('match', {matchId, opponentUser: botUser});

        botUpdateListener.start({matchId, botUser, playerUser: userRepository.getOwnUser()});

        userRepository.reconnectBot();
    }

    function joinPlayerMatch(matchId, playerIds) {
        const ownUserId = userRepository.getOwnUser().id;
        const opponentUserId = playerIds.find(id => id !== ownUserId);
        const users = userRepository.getAllLocal();
        const opponentUser = users.find(u => u.id === opponentUserId);
        route('match', {matchId, opponentUser});
    }
};

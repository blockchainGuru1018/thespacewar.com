const localGameDataFacade = require("../utils/localGameDataFacade")
const getCardImageUrl = require('../utils/getCardImageUrl.js');
const ajax = require('../utils/ajax.js');

module.exports = function ({pageDependencies}) {

    let progressIntervalId = null;
    const rawCardDataRepository = pageDependencies.rawCardDataRepository;
    const userRepository = pageDependencies.userRepository;
    const cardDataAssembler = pageDependencies.cardDataAssembler;

    return {
        namespaced: true,
        name: 'loading',
        state: {
            loaded: false,
            progress: 0
        },
        getters: {
            loadingDone
        },
        actions: {
            load,
            initFakeLoadingProgress,
            _authenticateUserSession,
            _loadOwnUser,
            _resetLocallyStoredUserData,
            _login,
            _restorePreviousSession,
            _reinitializeUserSession
        }
    };

    function loadingDone(state) {
        return state.progress >= 140 && state.loaded;
    }

    async function load({state, dispatch}) {
        dispatch('initFakeLoadingProgress');
        state.loaded = false;

        await Promise.all([
            dispatch('_authenticateUserSession'),
            loadAllImages()
        ]);

        state.loaded = true;
    }

    async function _authenticateUserSession({dispatch, rootGetters}) {
        const loggedInToHome = await isLoggedInToHome();
        if (!loggedInToHome) {
            dispatch('_resetLocallyStoredUserData');
        } else if (await isLoggedInToGame() && rootGetters['login/checkIfHasPreviousSession']) {
            dispatch('_restorePreviousSession');
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
        dispatch('_login');
    }

    async function _login({dispatch}) {
        const user = await ajax.jsonPost('/login');
        const ownUser = localGameDataFacade.setOwnUser(user);
        dispatch('user/storeOwnUser', ownUser, {root: true});
    }

    function _resetLocallyStoredUserData({dispatch}) {
        localGameDataFacade.removeAll();
        dispatch('user/storeOwnUser', null, {root: true});
    }

    function initFakeLoadingProgress({state, getters}) {
        progressIntervalId = setInterval(() => {
            state.progress += Math.random() < .5 ? Math.random() < .5 ? .4 : .8 : 1.6;
            // state.progress += 100;
            if (getters.loadingDone) {
                clearInterval(progressIntervalId);
            }
        }, 10);
    }

    async function loadAllImages() {
        await rawCardDataRepository.init();

        const sources = cardDataAssembler.createLibrary().map(cardData => getCardImageUrl.byCommonId(cardData.commonId));
        await Promise.all(sources.map(loadImage));
    }

    function loadImage(source) {
        return new Promise(resolve => {
            const image = new Image();
            image.onload = resolve;
            image.src = source;
        });
    }
};

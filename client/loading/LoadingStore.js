const localGameDataFacade = require("../utils/localGameDataFacade")
const getCardImageUrl = require('../utils/getCardImageUrl.js');
const ajax = require('../utils/ajax.js');

module.exports = function ({ pageDependencies }) {

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
            _resetLocallyStoredUserData
        }
    };

    function loadingDone(state) {
        return state.progress >= 140 && state.loaded;
    }

    async function load({ state, rootGetters, dispatch }) {
        dispatch('initFakeLoadingProgress');
        state.loaded = false;

        await rawCardDataRepository.init();

        const loggedInToHome = await isLoggedInToHome();
        if(!loggedInToHome) {
            // Show the NEW Login page
        } else if (isLoggedInToGame() && await existsOnServer()) {
            const ownUser = localGameDataFacade.getOwnUser();
            dispatch('user/storeOwnUser', ownUser, {root: true});
            if (rootGetters['login/checkIfHasPreviousSession']()) {
                await dispatch('login/restoreFromPreviousSession', null, {root: true});
                // Show match
            }
            else {
                // Show lobby
            }
        } else {
            dispatch('_resetLocallyStoredUserData');

            await ajax.jsonPost('/login');

            // Show lobby view
        }

        await loadAllImages();

        state.loaded = true;
    }

    async function existsOnServer(){
        const ownUser = localGameDataFacade.getOwnUser();
        const allUsers = await userRepository.getAll();
        return allUsers.some(u => u.id === ownUser.id);
    }

    function _resetLocallyStoredUserData({dispatch}) {
        localGameDataFacade.removeAll();
        dispatch('user/storeOwnUser', null, {root: true});
    }

    function initFakeLoadingProgress({ state, getters }) {
        progressIntervalId = setInterval(() => {
            state.progress += Math.random() < .5 ? Math.random() < .5 ? .4 : .8 : 1.6;
            // state.progress += 100;
            if (getters.loadingDone) {
                clearInterval(progressIntervalId);
            }
        }, 10);
    }

    function isLoggedInToGame() {
        return !!localGameDataFacade.getOwnUser();
    }

    async function isLoggedInToHome() {
        const {isLoggedIn} = await ajax.get('/is-logged-in-to-home');
        return isLoggedIn;
    }

    async function loadAllImages() {
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

const localGameDataFacade = require("../utils/localGameDataFacade")
const getCardImageUrl = require('../utils/getCardImageUrl.js');

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
            initFakeLoadingProgress
        }
    };

    function loadingDone(state) {
        return state.progress >= 140 && state.loaded;
    }

    async function load({ state, rootGetters, dispatch }) {
        dispatch('initFakeLoadingProgress');
        state.loaded = false;

        await rawCardDataRepository.init();

        if (isAlreadyLoggedIn()) {
            const ownUser = localGameDataFacade.getOwnUser();

            const allUsers = await userRepository.getAll();
            const existsOnServer = allUsers.some(u => u.id === ownUser.id);
            if (existsOnServer) {
                dispatch('user/storeOwnUser', ownUser, { root: true });
            }
            else {
                localGameDataFacade.removeAll();
                dispatch('user/storeOwnUser', null, { root: true });
            }
        }

        if (rootGetters['login/checkIfHasPreviousSession']()) {
            await dispatch('login/restoreFromPreviousSession', null, { root: true });
        }
        await loadAllImages();

        state.loaded = true;
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

    function isAlreadyLoggedIn() {
        return !!localGameDataFacade.getOwnUser();
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

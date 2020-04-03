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
        let d = performance.now();

        dispatch('initFakeLoadingProgress');
        state.loaded = false;

        let a = performance.now();
        await rawCardDataRepository.init();
        console.info('raw data load:', performance.now() - a);

        let b = performance.now();
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
        console.info('login:', performance.now() - b);

        let c = performance.now();
        if (rootGetters['login/checkIfHasPreviousSession']()) {
            await dispatch('login/restoreFromPreviousSession', null, { root: true });
        }
        console.info('restore match:', performance.now() - c);

        console.info(' - loading images - ');
        await loadAllImages();
        console.info(' - FINISHED - ');

        state.loaded = true;

        console.info('total:', performance.now() - d)
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

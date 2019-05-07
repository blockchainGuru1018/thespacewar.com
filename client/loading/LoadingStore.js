const localGameDataFacade = require("../utils/localGameDataFacade")

module.exports = function ({
    rootStore,
    pageDependencies
}) {

    let progressIntervalId = null;
    const rawCardDataRepository = pageDependencies.rawCardDataRepository;
    const userRepository = pageDependencies.userRepository;

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
    }

    function loadingDone(state) {
        return state.progress >= 140 && state.loaded;
    }

    async function load({ state, dispatch, rootGetters }) {
        let d = performance.now();

        dispatch('initFakeLoadingProgress');
        state.loaded = false;

        let a = performance.now();
        await rawCardDataRepository.init();
        console.log('raw data load:', performance.now() - a)

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
        console.log('login:', performance.now() - b)

        let c = performance.now();
        if (rootGetters['login/checkIfHasPreviousSession']()) {
            await dispatch('login/restoreFromPreviousSession', null, { root: true });
        }
        console.log('restore match:', performance.now() - c)

        state.loaded = true;

        console.log('total:', performance.now() - d)
    }

    function initFakeLoadingProgress({ state, getters }) {
        progressIntervalId = setInterval(() => {
            // state.progress += Math.random() < .5 ? Math.random() < .5 ? .4 : .8 : 1.6;
            state.progress += 100;
            if (getters.loadingDone) {
                clearInterval(progressIntervalId);
            }
        }, 10);
    }

    function isAlreadyLoggedIn() {
        return !!localGameDataFacade.getOwnUser();
    }
};

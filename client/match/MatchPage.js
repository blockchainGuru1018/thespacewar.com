const Vue = require('vue').default || require('vue');
const STORES = [
    require('./RequirementStore.js'),
    require('./PermissionStore.js'),
    require('./CardStore.js'),
    require('./loadingIndicator/LoadingIndicatorStore.js')
];
const MatchStore = require('./MatchStore.js');
const MatchView = require('./Match.vue').default;

module.exports = function (deps) {

    const rootStore = deps.rootStore;

    let vm;

    return {
        show,
        hide
    };

    function show({ matchId, opponentUser }) {
        if (rootStore.state.match) {
            rootStore.unregister('match');
        }
        const matchController = deps.matchControllerFactory.create({
            matchId,
            dispatch: (actionName, data) => rootStore.dispatch(`match/${actionName}`, data)
        });
        let matchStore = MatchStore({ ...deps, matchId, opponentUser, matchController });

        //TODO GENERALIZE TO COMMON "LOGGING DECORATOR"
        const originalMatchActions = matchStore.actions;
        const loggedMatchActions = {};
        Object.keys(matchStore.actions).forEach(actionName => {
            loggedMatchActions[actionName] = (...args) => {
                console.log(`[${new Date().toISOString()}] ACTION: ${actionName}`, { ...args });
                return originalMatchActions[actionName](...args);
            };
        });
        matchStore.actions = loggedMatchActions;

        rootStore.registerModule('match', matchStore);
        matchController.start();

        const rootDispatch = new Proxy({
            store: ''
        }, {
            get(target, property, reciever) {
                if (!target.store) {
                    target.store = property;
                    return reciever;
                }
                else {
                    let storeName = target.store;
                    target.store = '';
                    return (...args) => rootStore.dispatch(`${storeName}/${property}`, ...args);
                }
            }
        });

        for (const Store of STORES) {
            const store = Store({
                ...deps,
                matchController,
                getFrom: (getterName, moduleName) => rootStore.getters[`${moduleName}/${getterName}`],
                rootDispatch
            });

            //TODO GENERALIZE TO COMMON "LOGGING DECORATOR"
            const originalActions = store.actions;
            const loggedActions = {};
            Object.keys(store.actions).forEach(actionName => {
                loggedActions[actionName] = (...args) => {
                    console.log(`[${new Date().toISOString()}] ACTION: ${actionName}`, { ...args });
                    return originalActions[actionName](...args);
                };
            });
            store.actions = loggedActions;

            registerStoreModule(store);
        }

        vm = new Vue({
            store: rootStore,
            render(h) {
                return h(MatchView, {});
            }
        });
        const hook = document.createElement('div');
        document.body.appendChild(hook);
        vm.$mount(hook);
    }

    function hide() {
        vm.$destroy();
        vm.$el.remove();
        vm.$store.unregisterModule('match');
        vm = null;
    }

    function registerStoreModule(store) {
        if (rootStore.state[store.name]) rootStore.unregister(store.name);
        rootStore.registerModule(store.name, store);
    }
};
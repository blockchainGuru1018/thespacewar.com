const Vue = require('vue').default || require('vue');
const STORES = [
    require('./RequirementStore.js'),
    require('./PermissionStore.js'),
    require('./PutDownCardStore.js')
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
        rootStore.registerModule('match', matchStore);
        matchController.start();

        for (const Store of STORES) {
            const store = Store({
                ...deps,
                matchController,
                getFrom: (getterName, moduleName) => rootStore.getters[`${moduleName}/${getterName}`]
            });
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
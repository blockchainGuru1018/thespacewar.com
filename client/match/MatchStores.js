const STORES = [
    require('./MatchStore.js'),
    require('./RequirementStore.js'),
    require('./PermissionStore.js'),
    require('./CardStore.js'),
    require('./loadingIndicator/LoadingIndicatorStore.js')
];
const LOGGING_ENABLED = false;

module.exports = function (deps) {

    const rootStore = deps.rootStore;
    const matchId = deps.matchId;
    const matchControllerFactory = deps.matchControllerFactory;

    let matchController = matchControllerFactory.create({ matchId, dispatch: createMatchDispatch(rootStore) });
    let stores = [];

    deps.rootDispatch = createRootDispatch(rootStore);
    deps.getFrom = createRootGetFrom(rootStore);
    deps.matchController = matchController;

    for (const Store of STORES) {
        const store = createStore(Store, deps);
        stores.push(store);
        registerStoreModule(rootStore, store);
    }

    matchController.start();

    return {
        destroyAll
    };

    function destroyAll() {
        unregisterAllStores(rootStore, stores);
        matchController.stop();
    }
};

function createMatchDispatch(rootStore) {
    return (actionName, data) => rootStore.dispatch(`match/${actionName}`, data);
}

function createStore(Store, deps) {
    const store = Store({ ...deps });
    store.actions = loggedActions(store.actions);
    return store;
}

function loggedActions(actions) {
    const loggedActions = {};
    Object.keys(actions).forEach(actionName => {
        loggedActions[actionName] = (...args) => {
            if (LOGGING_ENABLED) {
                console.log(`[${new Date().toISOString()}] ACTION: ${actionName}`, { ...args });
            }
            return actions[actionName](...args);
        };
    });
    return loggedActions;
}

function registerStoreModule(rootStore, store) {
    if (rootStore.state[store.name]) rootStore.unregister(store.name);
    rootStore.registerModule(store.name, store);
}

function unregisterAllStores(rootStore, stores) {
    for (const store of stores) {
        unregisterStoreModule(rootStore, store.name);
    }
}

function unregisterStoreModule(rootStore, storeName) {
    rootStore.unregisterModule(storeName);
}

function createRootGetFrom(rootStore) {
    return (getterName, moduleName) => rootStore.getters[`${moduleName}/${getterName}`];
}

function createRootDispatch(rootStore) {
    return new Proxy(
        { store: '' },
        {
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
        }
    )
}
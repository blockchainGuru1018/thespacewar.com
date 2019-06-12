const STORES = [
    require('./MatchStore.js'),
    require('./RequirementStore.js'),
    require('./PermissionStore.js'),
    require('./CardStore.js'),
    require('./KeyboardShortcutsStore.js'),
    require('./findCard/FindCardStore.js'),
    require('./counterCard/CounterCardStore.js'),
    require('./counterAttack/CounterAttackStore.js'),
    require('./loadingIndicator/LoadingIndicatorStore.js'),
    require('../expandedCard/ExpandedCardStore.js'),
    require('./chooseStartingPlayer/ChooseStartingPlayerStore.js'),
    require('./escapeMenu/EscapeMenuStore.js'),
    require('./ghost/GhostStore.js')
];
const AI = require('./AI.js');
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
    deps.ai = AI({ rootStore, matchController });

    for (const Store of STORES) {
        const store = createStore(Store, deps);
        stores.push(store);
        registerStoreModule(rootStore, store);
    }

    matchController.start();

    initStores(stores, rootStore);

    return {
        destroyAll
    };

    function destroyAll() {
        destroyAndUnregisterAllStores(rootStore, stores);
        matchController.stop();
    }
};

function initStores(stores, rootStore) {
    for (const store of stores) {
        if (store.actions && store.actions.init) {
            rootStore.dispatch(`${store.name}/init`);
        }
    }
}

function createMatchDispatch(rootStore) {
    return (actionName, data) => rootStore.dispatch(`match/${actionName}`, data);
}

function createStore(Store, deps) {
    const store = Store({ ...deps });
    store.actions = loggedActions(store.actions);
    return store;
}

function loggedActions(actions = {}) {
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

function destroyAndUnregisterAllStores(rootStore, stores) {
    for (const store of stores) {
        if (store.actions && store.actions.destroy) {
            rootStore.dispatch(`${store.name}/destroy`);
        }

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

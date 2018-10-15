const Vue = require('vue');
const LobbyStore = require('./LobbyStore.js');
const LobbyView = require('./Lobby.vue').default;

module.exports = function (deps) {

    const rootStore = deps.rootStore;

    let vm;

    return {
        show,
        hide
    };

    function show() {
        if (rootStore.state.lobby) {
            rootStore.unregister('lobby');
        }
        let lobbyStore = LobbyStore({ ...deps });
        rootStore.registerModule('lobby', lobbyStore);

        vm = new Vue({
            store: rootStore,
            render(h) {
                return h(LobbyView, {});
            }
        });
        const hook = document.createElement('div');
        document.body.appendChild(hook);
        vm.$mount(hook);
    }

    function hide() {
        vm.$destroy();
        vm.$el.remove();
        vm.$store.unregisterModule('lobby');
        vm = null;
    }
};
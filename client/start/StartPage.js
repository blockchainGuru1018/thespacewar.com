const resolveModuleWithPossibleDefault = require('../utils/resolveModuleWithPossibleDefault.js');
const Vue = resolveModuleWithPossibleDefault(require('vue'));
const StartView = resolveModuleWithPossibleDefault(require('./Start.vue'));

module.exports = function ({
                               route,
                               rootStore
                           }) {

    let vm;

    return {
        show,
        hide
    };

    function show() {
        vm = new Vue({
                store: rootStore,
                created() {
                    const uri = window.location.search.substring(1);
                    const params = new URLSearchParams(uri);
                    const deck = params.get("deck");
                   enableDeckToggle(deck);
                },
                render(h) {
                    return h(StartView);
                },
            }
        );

        const hook = document.createElement('div');
        document.body.appendChild(hook);
        vm.$mount(hook);

        rootStore.dispatch('loading/load');
    }

    function hide() {
        if (!vm) return;

        vm.$destroy();
        vm.$el.remove();
        vm = null;
    }


    function enableDeckToggle(deckName) {
        if (['the-swarm'].includes(deckName)) {
            localStorage.setItem(`ft-${deckName}-toggle`, 'true')
        }
    }

}
;
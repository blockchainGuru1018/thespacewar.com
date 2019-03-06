const resolveModuleWithPossibleDefault = require('../../client/utils/resolveModuleWithPossibleDefault.js');
const Vue = resolveModuleWithPossibleDefault(require('vue'));
const MatchView = require('./Match.vue').default;
const MatchStores = require('./MatchStores.js');

module.exports = function (deps) {

    const rootStore = deps.rootStore;

    let vm;
    let matchStores;

    return {
        show,
        hide
    };

    function show({ matchId, opponentUser }) {
        matchStores = MatchStores({ ...deps, matchId, opponentUser });

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
        if (vm) {
            vm.$destroy();
            vm.$el.remove();
            matchStores.destroyAll();
            vm = null;
        }
    }
}
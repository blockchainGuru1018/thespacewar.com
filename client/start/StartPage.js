const Vue = require('vue');
const StartView = require('./Start.vue').default;

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
            render(h) {
                return h(StartView);
            }
        });
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
};
const resolveModuleWithPossibleDefault = require('../../client/utils/resolveModuleWithPossibleDefault.js');
const Vue = resolveModuleWithPossibleDefault(require('vue'));
const Vuex = resolveModuleWithPossibleDefault(require('vuex'));
const PortalVue = resolveModuleWithPossibleDefault(require('portal-vue'));
const vClickOutside = resolveModuleWithPossibleDefault(require('v-click-outside'));

module.exports = function () {
    Vue.use(Vuex);
    Vue.use(PortalVue);
    Vue.use(vClickOutside);    
}
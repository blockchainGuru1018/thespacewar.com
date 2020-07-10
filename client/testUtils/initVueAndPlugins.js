const resolveModuleWithPossibleDefault = require("../utils/resolveModuleWithPossibleDefault.js");
const Vue = resolveModuleWithPossibleDefault(require("vue"));
const Vuex = resolveModuleWithPossibleDefault(require("vuex"));
const PortalVue = resolveModuleWithPossibleDefault(require("portal-vue"));
const vClickOutside = resolveModuleWithPossibleDefault(
  require("v-click-outside")
);
Vue.config.productionTip = false;
Vue.config.devtools = false;

module.exports = function () {
  Vue.use(Vuex);
  Vue.use(PortalVue);
  Vue.use(vClickOutside);
};

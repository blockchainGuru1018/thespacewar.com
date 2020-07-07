import localGameDataFacade from "../../utils/localGameDataFacade.js";
import ajax from "../../utils/ajax.js";
import { ViewNames } from "./views.js";

module.exports = function () {
  return {
    namespaced: true,
    name: "escapeMenu",
    state: {
      view: ViewNames.main,
      visible: false,
      validatedDebug: false,
    },
    actions: {
      validateDebug,
      toggleVisible,
      selectView,
      show,
      hide,
    },
  };

  async function validateDebug({ state }) {
    const { valid } = await ajax.jsonPost("/test-debug", {
      password: localGameDataFacade.DebugPassword.get(),
    });
    if (valid) {
      state.validatedDebug = true;
    }
  }

  function toggleVisible({ state }) {
    state.visible = !state.visible;
  }

  function selectView({ state }, viewName) {
    state.view = viewName;
  }

  function show({ state }) {
    state.visible = true;
  }

  function hide({ state }) {
    state.visible = false;
  }
};

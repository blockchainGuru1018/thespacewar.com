export default function ({ rootDispatch }) {
  return {
    namespaced: true,
    name: "infoMode",
    state: {
      visible: false,
      _shouldDisplayTutorialSuggestion: true,
    },
    actions: {
      _setVisibility,
      toggle,
      hideTutorialSuggestion,
      hide,
    },
    getters: {
      shouldDisplayTutorialSuggestion,
    },
    mutations: {
      toggleHideTutorialSuggestion: (state) => {
        state._shouldDisplayTutorialSuggestion = false;
      },
    },
  };

  function shouldDisplayTutorialSuggestion(
    state,
    getters,
    rootState,
    rootGetters
  ) {
    return (
      state._shouldDisplayTutorialSuggestion && !rootGetters["match/gameOn"]
    );
  }

  function _setVisibility({ state }, visible) {
    if (visible) {
      expandActionLog();
    } else {
      collapseActionLog();
    }
    state.visible = visible;
  }

  function toggle({ state, dispatch }) {
    dispatch("_setVisibility", !state.visible);
    dispatch("hideTutorialSuggestion");
  }

  function hide({ dispatch }) {
    dispatch("_setVisibility", false);
    dispatch("hideTutorialSuggestion");
  }

  function hideTutorialSuggestion({ commit }) {
    commit("toggleHideTutorialSuggestion");
  }

  function collapseActionLog() {
    rootDispatch.actionLog.collapse();
  }

  function expandActionLog() {
    rootDispatch.actionLog.expand();
  }
}

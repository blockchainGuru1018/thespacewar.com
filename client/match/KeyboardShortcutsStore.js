module.exports = function ({ rootStore }) {
  return {
    namespaced: true,
    name: "keyboardShortcuts",
    actions: {
      init,
      destroy,
    },
  };

  function init() {
    window.addEventListener("keydown", onKeyDown);
  }

  function destroy() {
    window.removeEventListener("keydown", onKeyDown);
  }

  function onKeyDown(event) {
    if (event.key === " ") {
      if (rootStore.getters["match/turnControl"].canToggleControlOfTurn()) {
        rootStore.dispatch("match/toggleControlOfTurn");
      }
    } else if (event.key === "Escape") {
      if (rootStore.state.escapeMenu.visible) {
        rootStore.dispatch("escapeMenu/hide");
      } else {
        rootStore.dispatch("escapeMenu/show");
      }
    }
  }
};

export default function () {
  return {
    namespaced: true,
    name: "actionLog",
    state: {
      expanded: true,
    },
    actions: {
      toggleExpanded,
      collapse,
      expand,
    },
  };

  function toggleExpanded({ state }) {
    state.expanded = !state.expanded;
  }

  function collapse({ state }) {
    state.expanded = false;
  }

  function expand({ state }) {
    state.expanded = true;
  }
}

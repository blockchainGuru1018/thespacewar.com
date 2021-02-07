module.exports = function ({ matchController }) {
  return {
    name: "findCard",
    namespaced: true,
    state: {
      selectedCardInfos: [],
      waiting: false,
    },
    getters: {
      requirement,
      filteredRequirement,
    },
    actions: {
      done,
      resetWaiting,
      selectCard,
    },
  };

  function requirement(state, getters, rootState, rootGetters) {
    const firstRequirement = rootGetters["requirement/firstRequirement"];
    const isFindCardRequirement =
      firstRequirement && firstRequirement.type === "findCard";
    if (isFindCardRequirement) {
      return firstRequirement;
    }
    return null;
  }

  function filteredRequirement(state, getters) {
    const cardGroups = getters.requirement.cardGroups
      .map((group) => {
        return {
          source: group.source,
          cards: group.cards.filter(
            (c) => !state.selectedCardInfos.some((i) => i.id === c.id)
          ),
        };
      })
      .filter((group) => group.cards.length > 0);

    return { cardGroups };
  }

  function done() {
    matchController.emit("selectCardForFindCardRequirement", {
      cardGroups: [],
    });
  }

  function resetWaiting ({state}){
    state.waiting = false;
  }

  function selectCard({ state, getters }, { id, source }) {
    state.selectedCardInfos.push({ id, source });
    if (getters.requirement.submitOnEverySelect) {
      const cardGroups = groupFromSelectedCardIdsBySource([{ id, source }]);
      matchController.emit("selectCardForFindCardRequirement", { cardGroups });
    } else if (state.selectedCardInfos.length === getters.requirement.count) {
      const cardGroups = groupFromSelectedCardIdsBySource(
        state.selectedCardInfos
      );
      state.selectedCardInfos = [];
      state.waiting = true;
      matchController.emit("selectCardForFindCardRequirement", { cardGroups });
    }
  }

  function groupFromSelectedCardIdsBySource(selectedCardInfos) {
    const cardIdsBySource = {};
    for (const info of selectedCardInfos) {
      cardIdsBySource[info.source] = cardIdsBySource[info.source] || [];
      cardIdsBySource[info.source].push(info.id);
    }

    const allSources = Object.keys(cardIdsBySource);
    return allSources.map((source) => ({
      source,
      cardIds: cardIdsBySource[source],
    }));
  }
};

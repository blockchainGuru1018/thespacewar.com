const MatchMode = require("../../../shared/match/MatchMode.js");
module.exports = function ({ matchController }) {
  return {
    name: "chooseStartingPlayer",
    namespaced: true,
    state: {},
    getters: {
      visible,
      player,
      opponent,
    },
    actions: {
      selectPlayerToStart,
    },
  };

  function visible(state, getters, rootState, rootGetters) {
    const somePlayerHasRetreated =
      !rootGetters["match/playerRetreated"] &&
      !rootGetters["match/opponentRetreated"];

    return (
      rootState.match.mode === MatchMode.chooseStartingPlayer &&
      rootState.match.currentPlayer === rootState.match.ownUser.id &&
      somePlayerHasRetreated
    );
  }

  function player(state, getters, rootState) {
    const ownUser = rootState.match.ownUser;
    return { id: ownUser.id, name: ownUser.name };
  }

  function opponent(state, getters, rootState) {
    const opponentUser = rootState.match.opponentUser;
    return { id: opponentUser.id, name: opponentUser.name };
  }

  function selectPlayerToStart(actionContext, playerToStartId) {
    matchController.emit("selectPlayerToStart", { playerToStartId });
  }
};

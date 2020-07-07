module.exports = function ({ matchService, stateSerializer }) {
  return {
    getRestorableState,
    restoreFromRestorableState,
  };

  function getRestorableState() {
    return stateSerializer.serialize(matchService.getState());
  }

  function restoreFromRestorableState({
    restorableStateJson,
    stateTreatmentMiddleware = [],
    keepActionLog = false,
  }) {
    const restorableState = stateSerializer.parse(restorableStateJson);
    delete restorableState.playerOrder;
    delete restorableState.playersConnected;

    const state = matchService.getState();
    if (keepActionLog) {
      for (const playerId of Object.keys(restorableState.playerStateById)) {
        restorableState.playerStateById[playerId].actionLogEntries =
          state.playerStateById[playerId].actionLogEntries;
      }
    }

    for (const key of Object.keys(restorableState)) {
      state[key] = restorableState[key];
    }

    stateTreatmentMiddleware.forEach((m) => m(state));

    matchService.setState(state);
  }
};

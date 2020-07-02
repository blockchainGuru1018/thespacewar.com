module.exports = function ({
    matchService,
    stateSerializer
}) {

    return {
        getRestorableState,
        restoreFromRestorableState
    };

    function getRestorableState() {
        return stateSerializer.serialize(matchService.getState());
    }

    function restoreFromRestorableState(restorableStateJson, stateTreatmentMiddleware = []) {
        const restorableState = stateSerializer.parse(restorableStateJson);
        delete restorableState.gameStartTime;
        delete restorableState.playerOrder;
        delete restorableState.playersConnected;

        const state = matchService.getState();
        for (const playerId of Object.keys(restorableState.playerStateById)) {
            restorableState.playerStateById[playerId].actionLogEntries = state.playerStateById[playerId].actionLogEntries;
        }

        for (const key of Object.keys(restorableState)) {
            state[key] = restorableState[key];
        }

        stateTreatmentMiddleware.forEach(m => m(state))

        matchService.setState(state);
    }
};

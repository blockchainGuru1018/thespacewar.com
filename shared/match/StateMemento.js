module.exports = function ({
    matchService,
    stateSerializer
}) {

    const stateAttackDataTuples = [];
    const stateCardIdTuples = [];

    return {
        saveStateForCardId,
        revertStateToBeforeCardWasPutDown,
        saveStateForAttackData,
        revertStateToBeforeAttack
    };

    function saveStateForCardId(cardId) {
        const state = stateSerializer.serialize(matchService.getState());
        stateCardIdTuples.push([state, cardId, Date.now()]);
    }

    function revertStateToBeforeCardWasPutDown(cardId) {
        const storedStateJson = stateCardIdTuples.slice().reverse().find(([_, id]) => id === cardId)[0];
        const restoredState = stateSerializer.parse(storedStateJson);
        restoreFromState(restoredState);
    }

    function saveStateForAttackData(stateBeforeAttack, attackData) {
        stateAttackDataTuples.push([stateBeforeAttack, attackData, Date.now()]);
    }

    function revertStateToBeforeAttack({ attackerCardData, defenderCardData, time }) {
        const storedStateJson = findStateFromDataKey({ attackerCardData, defenderCardData, time });
        const restoredState = stateSerializer.parse(storedStateJson);
        restoreFromState(restoredState);
    }

    function findStateFromDataKey({ attackerCardData, defenderCardData, time }) {
        const stateDataTuple = stateAttackDataTuples
            .slice()
            .reverse()
            .find(([_, dataKey]) => {
                return dataKey.attackerCardId === attackerCardData.id
                    && dataKey.defenderCardId === defenderCardData.id
                    && dataKey.time === time;
            });
        return stateDataTuple[0];
    }

    function restoreFromState(restoreState) {
        delete restoreState.gameStartTime;
        delete restoreState.playerOrder;
        delete restoreState.playersReady;

        const state = matchService.getState();
        for (let key of Object.keys(restoreState)) {
            state[key] = restoreState[key];
        }

        matchService.setState(state);
    }
};

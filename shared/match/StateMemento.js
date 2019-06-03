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

    function saveStateForAttackData(stateBeforeAttack, { attackerCardId, defenderCardIds, time }) {
        stateAttackDataTuples.push([
            stateBeforeAttack,
            { attackerCardId, defenderCardIds, time },
            Date.now()
        ]);
    }

    function revertStateToBeforeAttack({ attackerCardData, defenderCardsData, time }) {
        const storedStateJson = findStateFromDataKey({ attackerCardData, defenderCardsData, time });
        const restoredState = stateSerializer.parse(storedStateJson);
        restoreFromState(restoredState);
    }

    function findStateFromDataKey({ attackerCardData, defenderCardsData, time }) {
        const stateDataTuple = stateAttackDataTuples
            .slice()
            .reverse()
            .find(([_, dataKey]) => {
                return dataKey.attackerCardId === attackerCardData.id
                    && dataKey.defenderCardIds.every(cardId => defenderCardsData.some(cardData => cardData.id === cardId))
                    && dataKey.time === time;
            });
        return stateDataTuple[0];
    }

    function restoreFromState(restoreState) {
        delete restoreState.gameStartTime;
        delete restoreState.playerOrder;
        delete restoreState.playersReady;

        for (const playerId of Object.keys(restoreState.playerStateById)) {
            delete restoreState.playerStateById[playerId].actionLog;
        }

        const state = matchService.getState();
        for (let key of Object.keys(restoreState)) {
            state[key] = restoreState[key];
        }

        matchService.setState(state);
    }
};

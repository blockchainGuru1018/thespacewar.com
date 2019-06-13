module.exports = function ({
    matchService,
    stateSerializer,
    gameConfig
}) {

    let stateAttackDataTimeTuples = [];
    let stateCardIdTimeTuples = [];

    return {
        saveStateForCardId,
        revertStateToBeforeCardWasPutDown,
        saveStateForAttackData,
        revertStateToBeforeAttack
    };

    function clearOldPutDownCardState() {
        const now = Date.now();
        stateCardIdTimeTuples = stateCardIdTimeTuples.filter(([state, cardId, time]) => {
            return now - time <= gameConfig.timeToCounter();
        });
    }

    function clearOldAttackState() {
        const now = Date.now();
        stateAttackDataTimeTuples = stateAttackDataTimeTuples.filter(([state, attackData, time]) => {
            return now - time <= gameConfig.timeToCounter();
        });
    }

    function saveStateForCardId(cardId) {
        const state = stateSerializer.serialize(matchService.getState());
        stateCardIdTimeTuples.push([state, cardId, Date.now()]);
    }

    function revertStateToBeforeCardWasPutDown(cardId) {
        const storedStateJson = stateCardIdTimeTuples.slice().reverse().find(([_, id]) => id === cardId)[0];
        const restoredState = stateSerializer.parse(storedStateJson);
        restoreFromState(restoredState);

        clearOldPutDownCardState();
    }

    function saveStateForAttackData(stateBeforeAttack, { attackerCardId, defenderCardIds, time }) {
        stateAttackDataTimeTuples.push([
            stateBeforeAttack,
            { attackerCardId, defenderCardIds, time },
            Date.now()
        ]);
    }

    function revertStateToBeforeAttack({ attackerCardData, defenderCardsData, time }) {
        const storedStateJson = findStateFromDataKey({ attackerCardData, defenderCardsData, time });
        const restoredState = stateSerializer.parse(storedStateJson);
        restoreFromState(restoredState);

        clearOldAttackState();
    }

    function findStateFromDataKey({ attackerCardData, defenderCardsData, time }) {
        const stateDataTuple = stateAttackDataTimeTuples
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
        delete restoreState.playersConnected;

        const state = matchService.getState();
        for (const playerId of Object.keys(restoreState.playerStateById)) {
            restoreState.playerStateById[playerId].actionLogEntries = state.playerStateById[playerId].actionLogEntries;
        }

        for (let key of Object.keys(restoreState)) {
            state[key] = restoreState[key];
        }

        matchService.setState(state);
    }
};

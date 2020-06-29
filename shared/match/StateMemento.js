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
        stateCardIdTimeTuples = stateCardIdTimeTuples
            .filter(([state, cardId, time]) => {
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
        const [storedStateJson, _, timeForAction] = stateCardIdTimeTuples.slice().reverse().find(([_, id]) => id === cardId);
        const restoredState = stateSerializer.parse(storedStateJson);
        restoreFromState(restoredState, timeForAction);

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
        const [storedStateJson, _, timeForAction] = findStateTupleFromDataKey({
            attackerCardData,
            defenderCardsData,
            time
        });
        const restoredState = stateSerializer.parse(storedStateJson);
        restoreFromState(restoredState, timeForAction);

        clearOldAttackState();
    }

    function findStateTupleFromDataKey({ attackerCardData, defenderCardsData, time }) {
        return stateAttackDataTimeTuples
            .slice()
            .reverse()
            .find(([_, dataKey]) => {
                return dataKey.attackerCardId === attackerCardData.id
                    && dataKey.defenderCardIds.every(cardId => defenderCardsData.some(cardData => cardData.id === cardId))
                    && dataKey.time === time;
            });
    }

    function restoreFromState(restoreState, timeForAction) {
        delete restoreState.gameStartTime;
        delete restoreState.playerOrder;
        delete restoreState.playersConnected;

        const state = matchService.getState();
        for (const playerId of Object.keys(restoreState.playerStateById)) {
            restoreState.playerStateById[playerId].actionLogEntries = state.playerStateById[playerId].actionLogEntries;
        }

        for (const key of Object.keys(restoreState)) {
            state[key] = restoreState[key];
        }

        moveClockStartTime(timeForAction, state);

        matchService.setState(state);
    }

    function moveClockStartTime(timeForAction, state) {
        for (const playerId of Object.keys(state.playerStateById)) {
            const clock = state.playerStateById[playerId].clock;

            const now = Date.now();
            const timeSinceAction = now - timeForAction;
            clock.startTime += timeSinceAction;
            for (const event of clock.events) {
                event.time += timeSinceAction;
            }
        }
    }
};

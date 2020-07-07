module.exports = function ({ matchRestorer, gameConfig }) {
    let stateAttackDataTimeTuples = [];
    let stateCardIdTimeTuples = [];

    return {
        saveStateForCardId,
        revertStateToBeforeCardWasPutDown,
        saveStateForAttackData,
        revertStateToBeforeAttack,
    };

    function clearOldPutDownCardState() {
        const now = Date.now();
        stateCardIdTimeTuples = stateCardIdTimeTuples.filter(
            ([state, cardId, time]) => {
                return now - time <= gameConfig.timeToCounter();
            }
        );
    }

    function clearOldAttackState() {
        const now = Date.now();
        stateAttackDataTimeTuples = stateAttackDataTimeTuples.filter(
            ([state, attackData, time]) => {
                return now - time <= gameConfig.timeToCounter();
            }
        );
    }

    function saveStateForCardId(cardId) {
        const state = matchRestorer.getRestorableState();
        stateCardIdTimeTuples.push([state, cardId, Date.now()]);
    }

    function revertStateToBeforeCardWasPutDown(cardId) {
        const [storedStateJson, _, timeForAction] = stateCardIdTimeTuples
            .slice()
            .reverse()
            .find(([_, id]) => id === cardId);
        restoreFromState(storedStateJson, timeForAction);

        clearOldPutDownCardState();
    }

    function saveStateForAttackData(
        stateBeforeAttack,
        { attackerCardId, defenderCardIds, time }
    ) {
        stateAttackDataTimeTuples.push([
            stateBeforeAttack,
            { attackerCardId, defenderCardIds, time },
            Date.now(),
        ]);
    }

    function revertStateToBeforeAttack({
        attackerCardData,
        defenderCardsData,
        time,
    }) {
        const [storedStateJson, _, timeForAction] = findStateTupleFromDataKey({
            attackerCardData,
            defenderCardsData,
            time,
        });
        restoreFromState(storedStateJson, timeForAction);

        clearOldAttackState();
    }

    function findStateTupleFromDataKey({
        attackerCardData,
        defenderCardsData,
        time,
    }) {
        return stateAttackDataTimeTuples
            .slice()
            .reverse()
            .find(([_, dataKey]) => {
                return (
                    dataKey.attackerCardId === attackerCardData.id &&
                    dataKey.defenderCardIds.every((cardId) =>
                        defenderCardsData.some(
                            (cardData) => cardData.id === cardId
                        )
                    ) &&
                    dataKey.time === time
                );
            });
    }

    function restoreFromState(storedStateJson, timeForAction) {
        matchRestorer.restoreFromRestorableState({
            restorableStateJson: storedStateJson,
            stateTreatmentMiddleware: [MoveClockStartTime(timeForAction)],
            keepActionLog: true,
        });
    }

    function MoveClockStartTime(timeForAction) {
        return (state) => {
            const now = Date.now();
            state.gameStartTime = now;

            for (const playerId of Object.keys(state.playerStateById)) {
                const clock = state.playerStateById[playerId].clock;

                const timeSinceAction = now - timeForAction;
                clock.startTime += timeSinceAction;
                for (const event of clock.events) {
                    event.time += timeSinceAction;
                }
            }
        };
    }
};

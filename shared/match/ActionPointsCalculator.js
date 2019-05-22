const PHASES_AFTER_ACTION_PHASE = ['discard', 'attack', 'wait'];

module.exports = function ({ cardInfoRepository }) {

    return {
        calculate
    };

    function calculate({ phase, turn, events, actionStationCardsCount }) {
        let actionPoints = actionStationCardsCount * 2;
        const playerIsPastActionPhase = PHASES_AFTER_ACTION_PHASE.includes(phase);
        if (playerIsPastActionPhase) return actionPoints;

        actionPoints -= getCostOfDurationCardsLeftFromPreviousTurns(events, turn);

        const eventsThisTurn = events.filter(e => e.turn === turn && !e.grantedForFreeByEvent);
        for (let event of eventsThisTurn) {
            if (event.type === 'putDownCard') {
                if (shouldReducePointsByCostOfCard(event)) {
                    const cardCost = getCostOfCard(event.cardCommonId);
                    actionPoints -= cardCost;
                }

                if (event.location === 'station-action' && !event.startingStation) {
                    actionPoints -= 2;
                }
            }
            else if (event.type === 'counterCard') {
                const cardCost = getCostOfCard(event.counteredCardCommonId);
                actionPoints -= cardCost;
            }
            else if (event.type === 'removeStationCard') {
                if (event.phase === 'action' && event.location === 'station-action') {
                    actionPoints += 2;
                }
            }
            else if (event.type === 'overwork') {
                actionPoints += 2;
            }
        }

        const moveStationCardEventsThisTurn = eventsThisTurn.filter(e => e.type === 'moveStationCard');
        actionPoints += actionPointsToAddBecauseOfStationCardMoveEvents(moveStationCardEventsThisTurn);

        const cheatPoints = events.reduce((acc, e) => e.type === 'cheatAddActionPoints' ? acc + e.count : acc, 0);
        actionPoints += cheatPoints;

        if (actionPoints < 0 && phase === 'action') {
            console.error(
                'Player has negative action points but is in the Action phase. '
                + 'This is probably caused by a bug.'
                + ' The player will be compensated up to 0 action points, as long as the action points are negative.'
            );
            return 0;
        }
        else {
            return actionPoints;
        }
    }

    function getCostOfDurationCardsLeftFromPreviousTurns(events, turn) {
        let totalCost = 0;
        const durationCardsInPlay = new Set();
        for (const event of events) {
            if (eventIsPutDownDurationCardInZone(event, turn)) {
                durationCardsInPlay.add(event.cardId);
                totalCost += cardInfoRepository.getCost(event.cardCommonId);
            }
            else if (event.type === 'discardCard' && durationCardsInPlay.has(event.cardId)) {
                totalCost -= cardInfoRepository.getCost(event.cardCommonId);
            }
        }

        return totalCost;
    }

    function shouldReducePointsByCostOfCard(putDownCardEventFromCurrentTurn) {
        return putDownCardEventFromCurrentTurn.location === 'zone'
            || putDownCardEventFromCurrentTurn.putDownAsExtraStationCard;
    }

    function eventIsPutDownDurationCardInZone(event, turn) {
        return event.turn < turn
            && event.type === 'putDownCard'
            && event.location === 'zone'
            && cardInfoRepository.getType(event.cardCommonId) === 'duration';
    }

    function getCostOfCard(cardCommonId) {
        const cardCost = cardInfoRepository.getCost(cardCommonId);
        return cardCost || 0;
    }

    function actionPointsToAddBecauseOfStationCardMoveEvents(events) {
        let actionPointsToAdd = 0;

        const eventsByCardId = groupEventsByCardId(events);
        for (const cardId of Object.keys(eventsByCardId)) {
            const cardEvents = eventsByCardId[cardId];
            const startLocation = cardEvents[0].fromLocation;
            const endLocation = cardEvents[cardEvents.length - 1].toLocation;
            if (startLocation === 'station-action') {
                if (endLocation !== 'station-action') {
                    actionPointsToAdd += 2;
                }
            }
            else {
                if (endLocation === 'station-action') {
                    actionPointsToAdd -= 2;
                }
            }
        }

        return actionPointsToAdd;
    }

    function groupEventsByCardId(events) {
        const eventsByCardId = {};
        for (const event of events) {
            const cardId = event.cardId;
            if (eventsByCardId[cardId]) {
                eventsByCardId[cardId].push(event);
            }
            else {
                eventsByCardId[cardId] = [event];
            }
        }

        return eventsByCardId;
    }
};

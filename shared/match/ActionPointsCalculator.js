const PHASES_AFTER_ACTION_PHASE = ['discard', 'attack', 'wait'];

module.exports = function (deps) {

    const cardInfoRepository = deps.cardInfoRepository;

    return {
        calculate
    };

    function calculate({ phase, turn, events, actionStationCardsCount }) {
        let actionPoints = actionStationCardsCount * 2;
        const playerIsPastActionPhase = PHASES_AFTER_ACTION_PHASE.includes(phase);
        if (playerIsPastActionPhase) return actionPoints;

        actionPoints -= getCostOfDurationCardsLeftFromPreviousTurns(events, turn);

        const eventsThisTurn = events.filter(e => e.turn === turn);
        let hasPutDownZoneCardThatIsNotFree = false;
        for (let event of eventsThisTurn) {
            if (event.type === 'putDownCard') {
                if (event.location === 'zone') {
                    const cardCost = cardInfoRepository.getCost(event.cardCommonId);
                    if (cardCost > 0) {
                        actionPoints -= cardCost;
                        hasPutDownZoneCardThatIsNotFree = true;
                    }
                }
                else if (event.location === 'station-action') {
                    actionPoints -= 2;
                }
            }
            else if (event.type === 'discardCard') {
                if (event.phase === 'action' && event.isSacrifice) {
                    actionPoints += 2;
                }
            }
            else if (event.type === 'removeStationCard') {
                if (event.phase === 'action' && event.location === 'station-action') {
                    actionPoints += 2;
                }
            }
        }

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

    function eventIsPutDownDurationCardInZone(event, turn) {
        return event.turn < turn
            && event.type === 'putDownCard'
            && event.location === 'zone'
            && cardInfoRepository.getType(event.cardCommonId) === 'duration';
    }
}
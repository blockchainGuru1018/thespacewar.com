module.exports = function getActionPointsForPlayer(deps) {

    const cardInfoRepository = deps.cardInfoRepository;

    return {
        calculate
    };

    function calculate({ phase, turn, events, actionStationCardsCount }) {
        let actionPoints = actionStationCardsCount * 2;
        const playerIsPastActionPhase = phase === 'discard' || phase === 'attack';
        if (playerIsPastActionPhase) return actionPoints;

        const cardEventsThisTurn = events.filter(e => e.turn === turn && e.type === 'putDownCard');
        let hasPutDownZoneCardThatIsNotFree = false;
        for (let event of cardEventsThisTurn) {
            if (event.location === 'zone') {
                const cardCost = cardInfoRepository.getCost(event.cardId);
                if (cardCost > 0) {
                    actionPoints -= cardCost;
                    hasPutDownZoneCardThatIsNotFree = true;
                }
            }
            else if (event.location === 'station-action' && hasPutDownZoneCardThatIsNotFree) {
                actionPoints -= 2;
            }
        }

        return actionPoints;
    }
}
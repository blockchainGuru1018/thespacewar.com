module.exports = function getActionPointsForPlayer(deps) {

    const cardInfoRepository = deps.cardInfoRepository;

    return {
        calculate
    };

    function calculate({ phase, turn, events, actionStationCardsCount }) {
        let actionPoints = actionStationCardsCount * 2;
        const playerIsPastActionPhase = phase === 'discard' || phase === 'attack';
        if (playerIsPastActionPhase) return actionPoints;

        const eventsThisTurn = events.filter(e => e.turn === turn);
        let hasPutDownZoneCardThatIsNotFree = false;
        for (let event of eventsThisTurn) {
            if (event.type === 'putDownCard') {
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
            else if (event.type === 'discardCard' && event.phase === 'action') {
                actionPoints += 2;
            }
        }

        return actionPoints;
    }
}
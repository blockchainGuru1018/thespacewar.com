module.exports = function Card(deps) {

    const eventRepository = deps.eventRepository;
    const matchInfoRepository = deps.matchInfoRepository;
    const card = deps.card;

    return {
        canAttackStationCards,
        hasAttackedThisTurn
    };

    function canAttackStationCards() {
        const events = eventRepository.getAll();
        const moveCardEvent = hasMoved(card.id, events);
        if (!moveCardEvent) return false;

        const turn = matchInfoRepository.getTurn();
        return turnCountSinceMove(card.id, turn, events) > 0;
    }

    function hasAttackedThisTurn() {
        const events = eventRepository.getAll();
        const turn = matchInfoRepository.getTurn();
        return events.some(event => {
            return event.turn === turn
                && event.type === 'attack'
                && event.attackerCardId === card.id
        });
    }
}

function hasMoved(cardId, events) {
    return events.some(e => e.type === 'moveCard' && e.cardId === cardId);
}

function turnCountSinceMove(cardId, currentTurn, events) {
    const moveCardEvent = events.find(e => e.type === 'moveCard' && e.cardId === cardId);
    return currentTurn - moveCardEvent.turn;
}
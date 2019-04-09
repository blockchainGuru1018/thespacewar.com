class QueryEvents {

    constructor({ eventRepository }) {
        this._eventRepository = eventRepository;
    }

    hasMovedOnPreviousTurn(cardId, currentTurn) {
        const events = this._eventRepository.getAll();
        return this._cardHasMoved(cardId, events)
            && this._turnCountSinceMoveLast(cardId, currentTurn, events) > 0;
    }

    hasMovedOnTurn(cardId, turn) {
        return this.getMovesOnTurn(cardId, turn).length > 0;
    }

    _cardHasMoved(cardId, events) {
        return events.some(e => e.type === 'moveCard' && e.cardId === cardId);
    }

    _turnCountSinceMoveLast(cardId, currentTurn, events) {
        const moveCardEvent = events.slice().reverse().find(e => e.type === 'moveCard' && e.cardId === cardId);
        return currentTurn - moveCardEvent.turn;
    }

    getTurnWhenCardWasPutDown(cardId) {
        const events = this._eventRepository.getAll();
        const putDownEventForThisCard = events.find(e => {
            return e.type === 'putDownCard'
                && e.cardId === cardId;
        });
        if (!putDownEventForThisCard) throw new Error(`Asking when card (${cardId}) was put down. But card has not been put down.`);
        return putDownEventForThisCard.turn;
    }

    getAttacksOnTurn(cardId, turn) {
        const events = this._eventRepository.getAll();
        return events.filter(event => {
            return event.turn === turn
                && event.type === 'attack'
                && event.attackerCardId === cardId
        });
    }

    getRepairsOnTurn(cardId, turn) {
        const events = this._eventRepository.getAll();
        return events.filter(event => {
            return event.turn === turn
                && event.type === 'repairCard'
                && event.cardId === cardId;
        });
    }

    getMovesOnTurn(cardId, turn) {
        const events = this._eventRepository.getAll();
        return events.filter(event => {
            return event.turn === turn
                && event.type === 'moveCard'
                && event.cardId === cardId;
        });
    }

    getNonExtraStationCardsPutDownThisTurnCount(turn) {
        const putDownStationCardEvents = this._eventRepository.getAll().filter(e => {
            return e.turn === turn
                && e.type === 'putDownCard'
                && e.location.startsWith('station')
                && !e.putDownAsExtraStationCard
        });
        return putDownStationCardEvents.length;
    }

    getCardDrawsOnTurn(turn, { byEvent = false } = {}) {
        const events = this._eventRepository.getAll();
        return events.filter(event => {
            return event.turn === turn
                && event.type === 'drawCard'
                && event.byEvent === byEvent;
        });
    }
}

module.exports = QueryEvents;
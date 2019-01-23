class QueryEvents { // TODO rename QueryCardEvents?

    constructor(eventRepository) {
        this._eventRepository = eventRepository;
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

    getAllMoves(cardId) {
        const events = this._eventRepository.getAll();
        return events.filter(event => {
            return event.type === 'moveCard'
                && event.cardId === cardId;
        });
    }

    getStationCardsPutDownThisTurnCount(turn) {
        const putDownStationCardEvents = this._eventRepository.getAll().filter(e => {
            return e.turn === turn
                && e.type === 'putDownCard'
                && e.location.startsWith('station');
        })
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
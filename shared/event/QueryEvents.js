class QueryEvents {

    constructor(eventRepository) {
        this._eventRepository = eventRepository;
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

    getCardDrawsOnTurn(turn) {
        const events = this._eventRepository.getAll();
        return events.filter(event => {
            return event.turn === turn
                && event.type === 'drawCard';
        });
    }
}

module.exports = QueryEvents;
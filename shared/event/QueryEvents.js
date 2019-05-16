class QueryEvents {

    constructor({ eventRepository, opponentEventRepository, matchService }) {
        this._eventRepository = eventRepository;
        this._opponentEventRepository = opponentEventRepository;
        this._matchService = matchService;
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

    lastTookControlWithinTimeFrameSincePutDownCard(opponentCardId, millisecondsTimeFrame) {
        const timeSinceOpponentCardWasPutDown = this.getTimeWhenOpponentCardWasPutDown(opponentCardId);
        const playerEvents = this._eventRepository.getAll().slice();

        const indexOfLatestTakingOfControl = findLastIndex(playerEvents, e => e.type === 'takeControlOfOpponentsTurn');
        const indexOfLatestReleaseOfControl = findLastIndex(playerEvents, e => e.type === 'releaseControlOfOpponentsTurn');

        if (indexOfLatestTakingOfControl > indexOfLatestReleaseOfControl) {
            const takeControlOfOpponentsTurnEvent = playerEvents[indexOfLatestTakingOfControl];
            const timeDifference = takeControlOfOpponentsTurnEvent.created - timeSinceOpponentCardWasPutDown;
            return timeDifference >= 0 && timeDifference <= millisecondsTimeFrame;
        }

        return false;
    }

    getTimeWhenOpponentCardWasPutDown(opponentCardId) {
        const events = this._opponentEventRepository.getAll();
        const putDownEventForThisCard = events.find(e => {
            return e.type === 'putDownCard'
                && e.cardId === opponentCardId;
        });
        if (!putDownEventForThisCard) {
            return this._matchService.getGameStartTime();
        }
        return putDownEventForThisCard.created;
    }

    wasOpponentCardAtLatestPutDownInHomeZone(opponentCardId) {
        const eventsInReverse = this._opponentEventRepository.getAll().slice().reverse();
        const event = eventsInReverse.find(e => e.type === 'putDownCard' && e.cardId === opponentCardId);
        return event.location === 'zone';
    }

    wasOpponentCardAtLatestPutDownAsExtraStationCard(opponentCardId) {
        const eventsInReverse = this._opponentEventRepository.getAll().slice().reverse();
        const event = eventsInReverse.find(e => e.type === 'putDownCard' && e.cardId === opponentCardId);

        return event.location.startsWith('station-')
            && event.putDownAsExtraStationCard;
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

    countNonPaidExtraStationCardsPutDownOnTurn(turn) {
        return this._eventRepository
            .getAll()
            .filter(e => {
                return e.turn === turn
                    && e.type === 'putDownCard'
                    && e.location.startsWith('station')
                    && !e.putDownAsExtraStationCard
            })
            .length;
    }

    countFreeExtraStationCardsGrantedOnTurn(turn) {
        return this._eventRepository
            .getAll()
            .filter(e => {
                return e.turn === turn
                    && e.type === 'freeExtraStationCardGranted';
            })
            .reduce((acc, event) => {
                return acc + event.count
            }, 0);
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

function findLastIndex(collection, selector) {
    const indexInReverseCollection = collection.slice().reverse().findIndex(selector);
    if (indexInReverseCollection === -1) return -1;
    return (collection.length - 1) - indexInReverseCollection;
}

module.exports = QueryEvents;

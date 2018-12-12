const AttackEvent = require('../event/AttackEvent.js');
const DiscardCardEvent = require('../event/DiscardCardEvent.js');

class PlayerStateService {

    constructor(deps) {
        this._playerId = deps.playerId;
        this._matchService = deps.matchService;
        this._queryEvents = deps.queryEvents;
    }

    getPhase() {
        return this._getPlayerState().phase;
    }

    moreCardsCanBeDrawn() {
        let currentTurn = this._matchService.getTurn();
        let cardDrawEvents = this._queryEvents.getCardDrawsOnTurn(currentTurn);
        let cardsToDrawOnTurnCount = this.getStationDrawCardsCount();
        return cardsToDrawOnTurnCount > cardDrawEvents.length;
    }

    getCardsInOpponentZone() {
        return this
            ._getPlayerState()
            .cardsInOpponentZone;
    }

    getDiscardedCards() {
        return this
            ._getPlayerState()
            .discardedCards;
    }

    getEvents() {
        return this
            ._getPlayerState()
            .events;
    }

    getStationDrawCardsCount() {
        let stationCards = this.getStationCards();
        return stationCards
            .filter(card => card.place === 'draw')
            .length;
    }

    getStationCards() {
        const playerState = this._matchService.getPlayerState(this._playerId);
        return playerState.stationCards;
    }

    findCard(cardId) {
        const playerState = this._getPlayerState();
        return playerState.cardsInZone.find(c => c.id === cardId)
            || playerState.cardsInOpponentZone.find(c => c.id === cardId)
            || null;
    }

    getDeck() {
        const state = this._matchService.getState();
        return state.deckByPlayerId[this._playerId];
    }

    discardTopTwoCardsInDrawPile() {
        const deck = this.getDeck();
        const cards = deck.draw(2);
        for (let card of cards) {
            this.discardCard(card);
        }
    }

    discardCard(cardData) {
        const phase = this.getPhase().phase;
        const turn = this._matchService.getTurn();
        this.update(playerState => {
            playerState.discardedCards.push(cardData);
        });
        this.storeEvent(DiscardCardEvent({
            turn,
            phase,
            cardId: cardData.id,
            cardCommonId: cardData.commonId
        }));
    }

    registerAttack(attackerCardId) {
        const cardData = this.findCard(attackerCardId);
        if (cardData.type === 'missile') {
            this.removeCard(attackerCardId);
        }

        const turn = this._matchService.getTurn();
        const attackEvent = AttackEvent({ turn, attackerCardId, cardCommonId: cardData.commonId })
        this.storeEvent(attackEvent);
    }

    removeCard(cardId) {
        this.update(playerState => {
            const cardInZoneIndex = playerState.cardsInZone.findIndex(c => c.id === cardId);
            if (cardInZoneIndex >= 0) {
                playerState.cardsInZone.splice(cardInZoneIndex, 1);
            }
            else {
                const cardInOpponentZoneIndex = playerState.cardsInOpponentZone.findIndex(c => c.id === cardId);
                if (cardInOpponentZoneIndex >= 0) {
                    playerState.cardsInOpponentZone.splice(cardInOpponentZoneIndex, 1);
                }
            }
        });
    }

    updateCard(cardId, updateFn) {
        const playerState = this._getPlayerState();
        let card = playerState.cardsInZone.find(c => c.id === cardId)
            || playerState.cardsInOpponentZone.find(c => c.id === cardId);
        if (!card) throw Error('Could not find card when trying to update it. ID: ' + cardId);

        updateFn(card);
        return playerState;
    }

    updateStationCard(cardId, updateFn) {
        const playerState = this._getPlayerState();
        let stationCard = playerState.stationCards.find(s => s.card.id === cardId);
        if (!stationCard) throw Error('Could not find station card when trying to update it. ID: ' + cardId);

        updateFn(stationCard);
        return playerState;
    }

    storeEvent(event) {
        this.update(state => state.events.push(event));
    }

    update(updateFn) {
        const playerState = this._getPlayerState();
        updateFn(playerState);
        return playerState;
    }

    _getPlayerState() {
        return this._matchService.getPlayerState(this._playerId);
    }
}

module.exports = PlayerStateService;
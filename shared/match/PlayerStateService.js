const AttackEvent = require('../event/AttackEvent.js');
const DrawCardEvent = require('../event/DrawCardEvent.js');
const DiscardCardEvent = require('../event/DiscardCardEvent.js');
const MoveCardEvent = require('../event/MoveCardEvent.js');
const PutDownCardEvent = require('../PutDownCardEvent.js');

class PlayerStateService {

    constructor(deps) {
        this._playerId = deps.playerId;
        this._matchService = deps.matchService;
        this._queryEvents = deps.queryEvents;
        this._actionPointsCalculator = deps.actionPointsCalculator;
    }

    getPhase() {
        return this.getPlayerState().phase;
    }

    setPhase(phase) {
        this.update(playerState => {
            playerState.phase = phase;
        });
    }

    moreCardsCanBeDrawnForDrawPhase() {
        let currentTurn = this._matchService.getTurn();
        let cardDrawEvents = this._queryEvents.getCardDrawsOnTurn(currentTurn);
        let cardsToDrawOnTurnCount = this.getStationDrawCardsCount();
        return cardsToDrawOnTurnCount > cardDrawEvents.length;
    }

    hasAlreadyPutDownStationCardThisTurn() {
        let currentTurn = this._matchService.getTurn();
        return this._queryEvents.hasAlreadyPutDownStationCardThisTurn(currentTurn);
    }

    getCardsInOpponentZone() {
        return this
            .getPlayerState()
            .cardsInOpponentZone;
    }

    getCardsInZone() {
        return this
            .getPlayerState()
            .cardsInZone;
    }

    getDurationCards() {
        return this
            .getCardsInZone()
            .filter(c => c.type === 'duration');
    }

    hasCardOfSameTypeInZone(cardCommonId) {
        return this.getCardsInZone().some(c => c.commonId === cardCommonId);
    }

    getCardsOnHand() {
        return this
            .getPlayerState()
            .cardsOnHand;
    }

    getCardsOnHandCount() {
        return this.getCardsOnHand().length;
    }

    hasCardOnHand(cardId) {
        return this
            .getPlayerState()
            .cardsOnHand.some(c => c.id === cardId);
    }

    getDiscardedCards() {
        return this
            .getPlayerState()
            .discardedCards;
    }

    getStationCards() {
        const playerState = this.getPlayerState();
        return playerState.stationCards;
    }

    getUnflippedStationCardsCount() {
        const playerState = this.getPlayerState();
        return playerState.stationCards.filter(s => !s.flipped).length;
    }

    hasCardInStationCards(cardId) {
        return this.getStationCards().some(s => s.card.id === cardId);
    }

    hasCard(cardId) {
        return !!this.findCardFromAnySource(cardId);
    }

    getEvents() {
        return this
            .getPlayerState()
            .events;
    }

    getStationDrawCardsCount() {
        let stationCards = this.getStationCards();
        return stationCards
            .filter(card => card.place === 'draw')
            .length;
    }

    getDeck() {
        const state = this._matchService.getState();
        return state.deckByPlayerId[this._playerId];
    }

    getActionPointsForPlayer() {
        const playerState = this.getPlayerState();
        const playerStationCards = this.getStationCards();
        const actionStationCardsCount = playerStationCards.filter(s => s.place === 'action').length;
        const currentTurn = this._matchService.getTurn();
        return this._actionPointsCalculator.calculate({
            phase: playerState.phase,
            events: playerState.events,
            turn: currentTurn,
            actionStationCardsCount
        });
    }

    findStationCard(cardId) {
        const playerState = this.getPlayerState();
        return playerState.stationCards.find(s => s.card.id === cardId);
    }

    findCard(cardId) {
        const playerState = this.getPlayerState();
        return playerState.cardsInZone.find(c => c.id === cardId)
            || playerState.cardsInOpponentZone.find(c => c.id === cardId)
            || null;
    }

    findCardFromHand(cardId) {
        return this.getPlayerState().cardsOnHand.find(c => c.id === cardId)
            || null;
    }

    findCardFromAnySource(cardId) {
        const playerState = this.getPlayerState();

        const cardInZone = playerState.cardsInZone.find(c => c.id === cardId);
        if (cardInZone) return cardInZone;

        const cardInOpponentZone = playerState.cardsInOpponentZone.find(c => c.id === cardId);
        if (cardInOpponentZone) return cardInOpponentZone;

        const cardInStation = playerState.stationCards.find(s => s.card.id === cardId);
        if (cardInStation) return cardInStation.card;

        const cardOnHand = playerState.cardsOnHand.find(c => c.id === cardId);
        if (cardOnHand) return cardOnHand;

        return null;
    }

    addStationCard(cardData, location) {
        const stationLocation = location.split('-').pop();
        const stationCard = { place: stationLocation, card: cardData };
        this.update(playerState => {
            playerState.stationCards.push(stationCard);
        });
        const currentTurn = this._matchService.getTurn();
        this.storeEvent(PutDownCardEvent({
            turn: currentTurn,
            location,
            cardId: cardData.id,
            cardCommonId: cardData.commonId
        }));
        return stationCard;
    }

    addCardToHand(cardData) {
        this.update(playerState => {
            playerState.cardsOnHand.push(cardData);
        });
    }

    putDownCardInZone(cardData) {
        const currentTurn = this._matchService.getTurn();
        this.update(playerState => {
            playerState.cardsInZone.push(cardData);
        });
        this.storeEvent(PutDownCardEvent({
            turn: currentTurn,
            location: 'zone',
            cardId: cardData.id,
            cardCommonId: cardData.commonId
        }));
    }

    putDownEventCardInZone(cardData) {
        const currentTurn = this._matchService.getTurn();
        this.storeEvent(PutDownCardEvent({
            turn: currentTurn,
            location: 'zone',
            cardId: cardData.id,
            cardCommonId: cardData.commonId
        }));
        this.discardCard(cardData);
    }

    discardTopTwoCardsInDrawPile() {
        const deck = this.getDeck();
        const cards = deck.draw(2);
        for (let card of cards) {
            this.discardCard(card);
        }
    }

    discardCard(cardData, { isSacrifice = false } = {}) { //TODO must say if is sacrifice as they gain bonus card to the opponent
        const turn = this._matchService.getTurn();
        this.update(playerState => {
            playerState.discardedCards.push(cardData);
        });
        this.storeEvent(DiscardCardEvent({
            turn,
            phase: this.getPhase(),
            cardId: cardData.id,
            cardCommonId: cardData.commonId,
            isSacrifice
        }));
    }

    removeAndDiscardCardFromStationOrZone(cardId, discardCardOptions) {
        const cardData = this.findCardFromAnySource(cardId);
        this.removeCardFromStationOrZones(cardId);
        this.discardCard(cardData, discardCardOptions);
    }

    drawCard({ byEvent = false } = {}) {
        const deck = this.getDeck();
        const card = deck.drawSingle();
        this.update(state => {
            state.cardsOnHand.push(card);
        });

        const turn = this._matchService.getTurn();
        this.storeEvent(DrawCardEvent({ turn, byEvent }));

        return card;
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

    moveCard(cardId) {
        this.update(playerState => {
            const cardIsInHomeZone = playerState.cardsInZone.some(c => c.id === cardId)
            const cardZone = cardIsInHomeZone ? playerState.cardsInZone : playerState.cardsInOpponentZone;
            const cardZoneIndex = cardZone.findIndex(c => c.id === cardId);
            if (cardZoneIndex >= 0) {
                const [cardData] = cardZone.splice(cardZoneIndex, 1);
                const targetZone = cardIsInHomeZone ? playerState.cardsInOpponentZone : playerState.cardsInZone;
                targetZone.push(cardData);

                const turn = this._matchService.getTurn();
                this.storeEvent(MoveCardEvent({ turn, cardId, cardCommonId: cardData.commonId }));
            }
            else {
                throw new Error(`Failed to move card with ID: ${cardId}`);
            }
        });
    }

    flipStationCard(cardId) {
        this.updateStationCard(cardId, card => {
            card.flipped = true;
        });
    }

    removeCardFromStationOrZones(cardId) {
        if (!!this.findStationCard(cardId)) {
            this.removeStationCard(cardId);
        }
        else if (this.findCard(cardId)) {
            this.removeCard(cardId);
        }
    }

    removeCard(cardId) { // TODO Rename removeFromZones/removeFromAllZones/removeFromPlay
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

    removeStationCard(cardId) {
        this.update(playerState => {
            playerState.stationCards = playerState.stationCards.filter(s => s.card.id !== cardId);
        });
    }

    removeCardFromHand(cardId) {
        this.update(playerState => {
            const cardIndex = playerState.cardsOnHand.findIndex(c => c.id === cardId);
            if (cardIndex >= 0) {
                playerState.cardsOnHand.splice(cardIndex, 1);
            }
        });
    }

    updateCard(cardId, updateFn) {
        const playerState = this.getPlayerState();
        let card = playerState.cardsInZone.find(c => c.id === cardId)
            || playerState.cardsInOpponentZone.find(c => c.id === cardId);
        if (!card) throw Error('Could not find card when trying to update it. ID: ' + cardId);

        updateFn(card);
        return playerState;
    }

    updateStationCard(cardId, updateFn) {
        const playerState = this.getPlayerState();
        let stationCard = playerState.stationCards.find(s => s.card.id === cardId);
        if (!stationCard) throw Error('Could not find station card when trying to update it. ID: ' + cardId);

        updateFn(stationCard);
        return playerState;
    }

    storeEvent(event) {
        this.update(state => state.events.push(event));
    }

    update(updateFn) {
        const playerState = this.getPlayerState();
        updateFn(playerState);
        return playerState;
    }

    getPlayerState() {
        return this._matchService.getPlayerState(this._playerId);
    }
}

module.exports = PlayerStateService;
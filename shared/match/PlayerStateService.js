const AttackEvent = require('../event/AttackEvent.js');
const DrawCardEvent = require('../event/DrawCardEvent.js');
const DiscardCardEvent = require('../event/DiscardCardEvent.js');
const MoveCardEvent = require('../event/MoveCardEvent.js');
const PutDownCardEvent = require('../PutDownCardEvent.js');
const RepairCardEvent = require('../event/RepairCardEvent.js');
const RemoveStationCardEvent = require('../event/RemoveStationCardEvent.js');

class PlayerStateService {

    constructor({
        playerId,
        matchService,
        queryEvents,
        actionPointsCalculator,
        logger,
        cardFactory,
        eventFactory
    }) {
        this._playerId = playerId;
        this._matchService = matchService;
        this._queryEvents = queryEvents; //TODO Uses of this should be moved to "CanThePlayer" or "PlayerRuleService"
        this._actionPointsCalculator = actionPointsCalculator;
        this._cardFactory = cardFactory;
        this._eventFactory = eventFactory;
        this._logger = logger || { log: (...args) => console.log('PlayerStateService logger: ', ...args) };
        this._stateTouchListeners = [];
    }

    getPlayerId() {
        return this._playerId;
    }

    getPhase() {
        return this.getPlayerState().phase;
    }

    moreCardsCanBeDrawnForDrawPhase() {
        let currentTurn = this._matchService.getTurn();
        let cardDrawEvents = this._queryEvents.getCardDrawsOnTurn(currentTurn);
        let cardsToDrawOnTurnCount = this.getStationDrawCardsCount();
        return cardsToDrawOnTurnCount > cardDrawEvents.length;
    }

    deckIsEmpty() {
        return this.getDeck().getCardCount() === 0;
    }

    getCardsInDeck() {
        const deck = this.getDeck();
        return deck ? deck.getAll() : [];
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

    hasDurationCardInPlay() {
        return this.getDurationCards().length > 0;
    }

    getDurationCards() {
        return this
            .getCardsInZone()
            .filter(c => c.type === 'duration');
    }

    hasCardOnHand(cardId) {
        return this
            .getPlayerState()
            .cardsOnHand.some(c => c.id === cardId);
    }

    hasCardInStationCards(cardId) {
        return this.getStationCards().some(s => s.card.id === cardId);
    }

    hasCardOfTypeInZone(cardCommonId) { //TODO "type" is misleading, perhaps call is "hasCardWithCommonIdInAnyZone"
        return this.getCardsInZone().some(c => c.commonId === cardCommonId);
    }

    hasMatchingCardInSomeZone(matcher) {
        return this.hasMatchingCardInHomeZone(matcher)
            || this.getCardsInOpponentZone().map(c => this.createBehaviourCard(c)).some(matcher);
    }

    hasMatchingCardInHomeZone(matcher) {
        return this.getCardsInZone().map(c => this.createBehaviourCard(c)).some(matcher);
    }

    hasMatchingCardInSameZone(sameZoneAsCardId, matcher) {
        const targetZone = this.isCardInHomeZone(sameZoneAsCardId) ? this.getCardsInZone() : this.getCardsInOpponentZone();
        return targetZone.map(c => this.createBehaviourCard(c)).some(matcher);
    }

    getMatchingBehaviourCards(matcher) { //TODO This now returns behaviour cards, to have it return card data would be a hassle. Perhaps the responsibility to create cards could lie within playerStateService?
        return [
            ...this.getCardsInZone().map(c => this.createBehaviourCard(c)).filter(matcher),
            ...this.getCardsInOpponentZone().map(c => this.createBehaviourCard(c)).filter(matcher)
        ];
    }

    getMatchingBehaviourCardsPutDownAnywhere(matcher) {
        const matchingCardsInZone = this.getCardsInZone().map(c => this.createBehaviourCard(c)).filter(matcher);
        const matchingCardsInOpponentZone = this.getCardsInOpponentZone().map(c => this.createBehaviourCard(c)).filter(matcher);
        const matchingDiscardedCards = this.getDiscardedCards().map(c => this.createBehaviourCard(c)).filter(matcher);
        const matchingStationCards = this.getStationCards().filter(s => !!s.card).map(s => s.card).map(c => this.createBehaviourCard(c)).filter(matcher);
        return [...matchingCardsInZone, ...matchingCardsInOpponentZone, ...matchingDiscardedCards, ...matchingStationCards];
    }

    hasDurationCardOfType(cardCommonId) {
        return this.getDurationCards().some(c => c.commonId === cardCommonId);
    }

    hasCard(cardId) {
        return !!this.findCardFromAnySource(cardId);
    }

    hasCardThatStopsStationAttack() {
        return this
            .getCardsInZone()
            .map(c => this.createBehaviourCard(c))
            .some(c => c.stopsStationAttack());
    }

    getCardsOnHand() {
        return this
            .getPlayerState()
            .cardsOnHand;
    }

    getCardsOnHandCount() {
        return this.getCardsOnHand().length;
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

    getDrawStationCards() {
        return this
            .getStationCards()
            .filter(s => s.place === 'draw');
    }

    getActionStationCards() {
        return this
            .getStationCards()
            .filter(s => s.place === 'action');
    }

    getHandSizeStationCards() {
        return this
            .getStationCards()
            .filter(s => s.place === 'handSize');
    }

    getUnflippedStationCardsCount() {
        const playerState = this.getPlayerState();
        return playerState.stationCards.filter(s => !s.flipped).length;
    }

    hasFlippedStationCards() {
        const playerState = this.getPlayerState();
        return playerState.stationCards.filter(s => s.flipped).length > 0;
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

    /// These methods do queries on behaviour cards, perhaps these belong in a separate service?

    getAttackBoostForCard(card) {
        if (card.type === 'spaceShip') {
            const durationCards = this.getDurationCards().map(c => this.createBehaviourCard(c));
            return sum(durationCards, 'friendlySpaceShipAttackBonus');
        }
        return 0;
    }

    cardCanMoveOnTurnWhenPutDown(card) {
        if (card.type === 'spaceShip') {
            const durationCards = this.getDurationCards().map(c => this.createBehaviourCard(c));
            return durationCards.some(c => c.allowsFriendlySpaceShipsToMoveTurnWhenPutDown);
        }
        return false;
    }

    ///

    isCardInHomeZone(cardId) {
        return this.getPlayerState().cardsInZone.some(c => c.id === cardId);
    }

    isCardStationCard(cardId) {
        return this.getPlayerState().stationCards.some(s => getStationCardId(s) === cardId);
    }

    isCardFlipped(cardId) {
        const stationCard = this.findStationCard(cardId)
        return stationCard && stationCard.flipped;
    }

    findStationCard(cardId) {
        const playerState = this.getPlayerState();
        return this._findStationCardFromCollection(cardId, playerState.stationCards);
    }

    _findStationCardFromCollection(cardId, collection) {
        return collection.find(stationCard => stationCard.card && stationCard.card.id === cardId);
    }

    findCard(cardId) {//TODO Rename findCardFromZones
        const playerState = this.getPlayerState();
        return playerState.cardsInZone.find(c => c.id === cardId)
            || playerState.cardsInOpponentZone.find(c => c.id === cardId)
            || null;
    }

    findCardFromZonesAndDiscardPile(cardId) {
        const playerState = this.getPlayerState();
        return playerState.cardsInZone.find(c => c.id === cardId)
            || playerState.cardsInOpponentZone.find(c => c.id === cardId)
            || playerState.discardedCards.find(c => c.id === cardId)
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

        const cardInStation = playerState.stationCards.find(s => getStationCardId(s) === cardId);
        if (cardInStation) return cardInStation.card;

        const cardOnHand = playerState.cardsOnHand.find(c => c.id === cardId);
        if (cardOnHand) return cardOnHand;

        const discardedCard = playerState.discardedCards.find(c => c.id === cardId);
        if (discardedCard) return discardedCard;

        return null;
    }

    setPhase(phase) {
        this.update(playerState => {
            playerState.phase = phase;
        });
    }

    addStationCard(cardData, location, { putDownAsExtraStationCard = false } = {}) {
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
            cardCommonId: cardData.commonId,
            putDownAsExtraStationCard
        }));
        return stationCard;
    }

    addCardToHand(cardData) {
        this.update(playerState => {
            playerState.cardsOnHand.push(cardData);
        });
    }

    putDownCardInZone(cardData, { grantedForFreeByEvent = false } = {}) {
        const currentTurn = this._matchService.getTurn();
        this.update(playerState => {
            playerState.cardsInZone.push(cardData);
        });
        this.storeEvent(PutDownCardEvent({
            turn: currentTurn,
            location: 'zone',
            cardId: cardData.id,
            cardCommonId: cardData.commonId,
            grantedForFreeByEvent
        }));
    }

    putDownEventCardInZone(cardData) {
        const currentTurn = this._matchService.getTurn();

        const card = this.createBehaviourCard(cardData);
        card.eventSpecsWhenPutDownInHomeZone
            .map(this._eventFactory.fromSpec)
            .forEach(event => {
                this.storeEvent(event);
            });

        this.storeEvent(PutDownCardEvent({
            turn: currentTurn,
            location: 'zone',
            cardId: cardData.id,
            cardCommonId: cardData.commonId
        }));
        this.discardCard(cardData);
    }

    removeAndDiscardCardFromStationOrZone(cardId) {
        const cardData = this.findCardFromAnySource(cardId);
        this.removeCardFromStationOrZones(cardId);
        this.discardCard(cardData);
    }

    discardTopTwoCardsInDrawPile() {
        const deck = this.getDeck();
        if (deck.getCardCount() === 0) {
            this._logger.log(`PLAYERID=${this._playerId} Cannot mill, deck is empty`, 'playerStateService');
            return;
        }

        const cards = deck.draw(2);
        for (let card of cards) {
            this.discardCard(card);
        }
    }

    useToCounter(cardId) {
        const cardData = this.removeCardFromStationHandOrHomeZone(cardId);
        this.discardCard(cardData);
    }

    registerAttackCountered({ attackerCardId, defenderCardId = null, targetStationCardIds = null }) {
        const cardData = this.findCard(attackerCardId);
        const turn = this._matchService.getTurn();
        const attackEvent = AttackEvent({
            turn,
            attackerCardId,
            defenderCardId,
            targetStationCardIds,
            cardCommonId: cardData.commonId,
            countered: true
        });
        this.storeEvent(attackEvent);

        return attackEvent;
    }

    counterCard(cardId) { //TODO This should _always_ be called after has countered card and restored state to before that card was played. What could be a more descriptive name for this method?
        const cardData = this.removeCardFromStationOrHand(cardId);
        this.discardCard(cardData);
        this.storeEvent({
            type: 'counterCard',
            turn: this._matchService.getTurn(),
            counteredCardCommonId: cardData.commonId,
        });
    }

    discardCard(cardData) {
        const turn = this._matchService.getTurn();
        this.update(playerState => {
            playerState.discardedCards.push(cardData);
        });
        this.storeEvent(DiscardCardEvent({
            turn,
            phase: this.getPhase(),
            cardId: cardData.id,
            cardCommonId: cardData.commonId
        }));
    }

    drawCard({ byEvent = false } = {}) {
        const deck = this.getDeck();
        if (deck.getCardCount() === 0) {
            this._logger.log(`PLAYERID=${this._playerId} Cannot draw card, deck is empty`, 'playerStateService');
            return;
        }

        const card = deck.drawSingle();
        this.update(state => {
            state.cardsOnHand.push(card);
        });

        const turn = this._matchService.getTurn();
        this.storeEvent(DrawCardEvent({ turn, byEvent }));
    }

    registerMill({ byEvent = false } = {}) {
        if (!byEvent) {
            const turn = this._matchService.getTurn();
            this.storeEvent(new DrawCardEvent({ turn }));
        }
    }

    repairCard(repairerCardId, cardToRepairId) {
        const cardToRepair = this.createBehaviourCardById(cardToRepairId);
        const repairerCard = this.createBehaviourCardById(repairerCardId);
        repairerCard.repairCard(cardToRepair);

        if (cardToRepair.isStationCard()) {
            this.update(playerState => {
                const stationCardToRepair = playerState.stationCards.find(s => {
                    const id = s.card ? s.card.id : s.id;
                    return id === cardToRepairId;
                });
                stationCardToRepair.flipped = cardToRepair.flipped;
            });
        }
        else {
            this.updateCardById(cardToRepairId, card => {
                Object.assign(card, cardToRepair.getCardData());
            });
        }

        let currentTurn = this._matchService.getTurn();
        this.storeEvent(RepairCardEvent({
            turn: currentTurn,
            cardId: repairerCard.id,
            cardCommonId: repairerCard.commonId,
            repairedCardId: cardToRepair.id,
            repairedCardCommonId: cardToRepair.commonId
        }));
    }

    registerStationCollisionFromSacrifice(targetCardIds) {
        for (const targetCardId of targetCardIds) {
            this.flipStationCard(targetCardId);
        }
    }

    registerCardCollisionFromSacrifice(targetCardId) {
        const targetCardData = this.findCard(targetCardId);
        const targetCard = this.createBehaviourCard(targetCardData);
        const newTargetDamage = targetCard.damage ? targetCard.damage + 4 : 4;
        const targetDefense = targetCard.defense || 0;
        if (newTargetDamage >= targetDefense) {
            this.removeCard(targetCardId);
            this.discardCard(targetCardData);
        }
        else {
            this.updateCardById(targetCardId, card => {
                card.damage = newTargetDamage;
            });
        }
    }

    registerAttack({ attackerCardId, defenderCardId = null, targetStationCardIds = null }) {
        const cardData = this.findCard(attackerCardId);
        const turn = this._matchService.getTurn();
        const attackEvent = AttackEvent({
            turn,
            attackerCardId,
            defenderCardId,
            targetStationCardIds,
            cardCommonId: cardData.commonId
        });
        this.storeEvent(attackEvent);

        return attackEvent;
    }

    moveCard(cardId) {
        const cardsInZone = this.getCardsInZone();
        const cardIsInHomeZone = cardsInZone.some(c => c.id === cardId)
        const cardZone = cardIsInHomeZone ? cardsInZone : this.getCardsInOpponentZone();
        const cardZoneIndex = cardZone.findIndex(c => c.id === cardId);
        if (cardZoneIndex >= 0) {
            let updatedCardCommonId;
            this.update(playerState => {
                const cardZone = cardIsInHomeZone ? playerState.cardsInZone : playerState.cardsInOpponentZone;
                const [cardData] = cardZone.splice(cardZoneIndex, 1);
                const targetZone = cardIsInHomeZone ? playerState.cardsInOpponentZone : playerState.cardsInZone;
                targetZone.push(cardData);
                updatedCardCommonId = cardData.commonId;
            });

            const turn = this._matchService.getTurn();
            this.storeEvent(MoveCardEvent({ turn, cardId, cardCommonId: updatedCardCommonId }));
        }
        else {
            throw new Error(`Failed to move card with ID: ${cardId}`);
        }
    }

    flipStationCard(cardId) {
        this.updateStationCard(cardId, card => {
            card.flipped = true;
        });
    }

    removeCardFromStationOrZones(cardId) {
        if (this.findStationCard(cardId)) {
            const removedStationCard = this.removeStationCard(cardId);
            return removedStationCard.card;
        }
        else if (this.findCard(cardId)) {
            return this.removeCard(cardId);
        }
        return null;
    }

    removeCardFromStationOrHand(cardId) {
        if (this.findStationCard(cardId)) {
            const removedStationCard = this.removeStationCard(cardId);
            return removedStationCard.card;
        }
        else if (this.findCardFromHand(cardId)) {
            return this.removeCardFromHand(cardId);
        }
        return null;
    }

    removeCardFromStationHandOrHomeZone(cardId) {
        if (this.findStationCard(cardId)) {
            const removedStationCard = this.removeStationCard(cardId);
            return removedStationCard.card;
        }
        else if (this.findCardFromHand(cardId)) {
            return this.removeCardFromHand(cardId);
        }
        else if (this.getCardsInZone().find(c => c.id === cardId)) {
            return this.removeCardFromHomeZone(cardId);
        }
        return null;
    }

    removeCard(cardId) { // TODO Rename removeFromZones/removeFromAllZones/removeFromPlay
        const cardIndexInHomeZone = this.getCardsInZone().findIndex(c => c.id === cardId);
        let zoneName;
        let cardIndex;
        if (cardIndexInHomeZone >= 0) {
            zoneName = 'cardsInZone';
            cardIndex = cardIndexInHomeZone;
        }
        else {
            const cardInOpponentZoneIndex = this.getCardsInOpponentZone().findIndex(c => c.id === cardId);
            if (cardInOpponentZoneIndex >= 0) {
                zoneName = 'cardsInOpponentZone';
                cardIndex = cardInOpponentZoneIndex;
            }
        }

        let removedCard = null;

        if (zoneName) {
            this.update(playerState => {
                const zone = playerState[zoneName];
                removedCard = zone[cardIndex];
                zone.splice(cardIndex, 1);
            });
        }

        return removedCard;
    }

    removeCardFromHomeZone(cardId) {
        let removedCard = null;

        const cardIndex = this.getCardsInZone().findIndex(c => c.id === cardId);
        if (cardIndex >= 0) {
            this.update(playerState => {
                removedCard = playerState.cardsInZone[cardIndex];
                playerState['cardsInZone'].splice(cardIndex, 1);
            });
        }

        return removedCard;
    }

    removeStationCard(cardId) {
        let stationCard = this.findStationCard(cardId);
        this.update(playerState => {
            playerState.stationCards = playerState.stationCards.filter(s => s.card.id !== cardId);
        });

        this.storeEvent(RemoveStationCardEvent({
            stationCard,
            turn: this._matchService.getTurn(),
            phase: this.getPhase()
        }));

        return stationCard;
    }

    removeCardFromHand(cardId) {
        let removedCard = null;

        this.update(playerState => {
            const cardIndex = playerState.cardsOnHand.findIndex(c => c.id === cardId);
            if (cardIndex >= 0) {
                removedCard = playerState.cardsOnHand[cardIndex];
                playerState.cardsOnHand.splice(cardIndex, 1);
            }
        });

        return removedCard;
    }

    removeCardFromDeck(cardId) {
        const deck = this.getDeck();
        const card = deck.removeCard(cardId);
        return card;
    }

    removeCardFromDiscardPile(cardId) {
        const playerStateToRead = this.getPlayerState();
        const cardIndex = playerStateToRead.discardedCards.findIndex(c => c.id === cardId);
        if (cardIndex < 0) return null;

        return this.update(playerState => {
            const [removedCard] = playerState.discardedCards.splice(cardIndex, 1);
            return removedCard;
        });
    }

    updateCardById(cardId, updateFn) {
        const playerState = this.getPlayerState();
        let zoneName;
        if (playerState.cardsInZone.find(c => c.id === cardId)) {
            zoneName = 'cardsInZone';
        }
        else if (playerState.cardsInOpponentZone.find(c => c.id === cardId)) {
            zoneName = 'cardsInOpponentZone';
        }

        if (!zoneName) {
            throw Error('Could not find card when trying to update it. ID: ' + cardId);
        }

        this.update(playerState => {
            const cardToUpdate = playerState[zoneName].find(c => c.id === cardId);
            updateFn(cardToUpdate);
        });
    }

    updateStationCard(cardId, updateFn) {
        if (!this.findStationCard(cardId)) throw Error('Could not find station card when trying to update it. ID: ' + cardId);

        this.update(playerState => {
            const stationCards = playerState.stationCards
            const stationCard = this._findStationCardFromCollection(cardId, stationCards);
            updateFn(stationCard);
        });
    }

    storeEvent(event) {
        this.update(state => state.events.push(event));
    }

    update(updateFn) {
        const playerState = this.getPlayerState();

        const emit = this._emitStateTouched.bind(this);
        const playerId = this._playerId;
        const proxy = new Proxy(playerState, {
            set(target, property, value) {
                playerState[property] = value;
                emit({ property, playerId });
                return true;
            },
            get(target, property) {
                emit({ property, playerId });
                return target[property];
            }
        });

        return updateFn(proxy);
    }

    getPlayerState() {
        return this._matchService.getPlayerState(this._playerId);
    }

    listenForStateTouches(listener) {
        this._stateTouchListeners.push(listener);
    }

    _emitStateTouched(data) {
        for (const listener of this._stateTouchListeners) {
            listener(data);
        }
    }

    createBehaviourCardById(cardId) {
        const cardData = this.findCardFromAnySource(cardId);
        return this._cardFactory.createCardForPlayer(cardData, this._playerId);
    }

    createBehaviourCard(cardData) {
        return this._cardFactory.createCardForPlayer(cardData, this._playerId);
    }
}

module.exports = PlayerStateService;

function sum(arr, accessorKey) {
    return arr.reduce((acc, v) => acc + (v[accessorKey] || 0), 0);
}

function getStationCardId(stationCard) {
    return stationCard.card ? stationCard.card.id : stationCard.id;
}

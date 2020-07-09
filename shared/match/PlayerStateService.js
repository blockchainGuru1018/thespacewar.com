const AttackEvent = require('../event/AttackEvent.js');
const DrawCardEvent = require('../event/DrawCardEvent.js');
const DiscardCardEvent = require('../event/DiscardCardEvent.js');
const MoveCardEvent = require('../event/MoveCardEvent.js');
const AddCardToHandEvent = require('../event/AddCardToHandEvent.js');
const PutDownCardEvent = require('../PutDownCardEvent.js');
const RemoveStationCardEvent = require('../event/RemoveStationCardEvent.js');
const MatchMode = require('./MatchMode.js');
const {PHASES} = require('../phases.js');

class PlayerStateService {

    constructor({
                    playerId,
                    matchService,
                    queryEvents,
                    actionPointsCalculator,
                    logger,
                    cardFactory,
                    eventFactory,
                    deckFactory,
                    gameConfig
                }) {
        this._playerId = playerId;
        this._matchService = matchService;
        this._actionPointsCalculator = actionPointsCalculator;
        this._cardFactory = cardFactory;
        this._eventFactory = eventFactory;
        this._deckFactory = deckFactory;
        this._gameConfig = gameConfig;
        this._logger = logger || {log: (...args) => console.log('PlayerStateService logger: ', ...args)};
        this._stateTouchListeners = [];
    }

    isBot() {
        const playerId = this.getPlayerId();
        return playerId === "BOT";
    }

    reset(useTheSwarmDeck = false) {
        const playerId = this.getPlayerId();
        this._matchService.connectPlayer(playerId); //TODO This is already done in StartGame.js. Why is it also done here?

        this._resetState();
        this._initializeDeck(useTheSwarmDeck);
        this._drawStartingCards();
    }

    _resetState() {
        this.update(playerState => {
            playerState.cardsInDeck = [];
            playerState.cardsOnHand = [];
            playerState.stationCards = [];
            playerState.cardsInZone = [];
            playerState.cardsInOpponentZone = [];
            playerState.discardedCards = [];
            playerState.phase = PHASES.start;
            playerState.actionPoints = 0;
            playerState.events = [];
            playerState.requirements = [];
            playerState.actionLogEntries = [];
            playerState.commanders = [];
            playerState.clock = {};
            playerState.deckName = ''
        });
    }

    _initializeDeck(useTheSwarmDeck = false) {
        const cardsInDeck = this._deckFactory.createCardsForDeck(useTheSwarmDeck);
        const deckName = useTheSwarmDeck ? 'The-Swarm' : 'Regular';
        this.update(playerState => {
            playerState.cardsInDeck = cardsInDeck;
            playerState.deckName = deckName;
        });
    }

    _drawStartingCards() {
        const startingHandCount = this._gameConfig.amountOfCardsInStartHand();
        let cardsOnHand;
        this.useDeck(deck => {
            cardsOnHand = deck.draw(startingHandCount);
        });
        this.update(playerState => {
            playerState.cardsOnHand = cardsOnHand;
        });
    }

    readyForSelectingStationCards() {
        const isFirstPlayer = this.isFirstPlayer();
        this.update(playerState => {
            playerState.phase = isFirstPlayer ? PHASES.start : 'wait';
        });
    }

    selectStartingStationCard(cardId, location) {
        const cardData = this.removeCardFromHand(cardId);
        this.addStationCard(cardData, location, {startingStation: true});
    }

    isReadyForGame() {
        const state = this._matchService.getState();
        const playerId = this.getPlayerId();

        return state.mode === MatchMode.selectStationCards
            && state.readyPlayerIds.includes(playerId);
    }

    isFirstPlayer() {
        const playerOrder = this._matchService.getPlayerOrder();
        return playerOrder[0] === this.getPlayerId();
    }

    getPlayerId() {
        return this._playerId;
    }

    getPhase() {
        return this.getPlayerState().phase;
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

    getDurationBehaviourCards() {
        return this.getDurationCards().map(c => this.createBehaviourCard(c));
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
            ...this.getMatchingBehaviourCardsInZone(matcher),
            ...this.getCardsInOpponentZone().map(c => this.createBehaviourCard(c)).filter(matcher)
        ];
    }

    getMatchingBehaviourCardsInZone(matcher) {
        return this.getCardsInZone().map(c => this.createBehaviourCard(c)).filter(matcher);
    }

    getMatchingBehaviourCardsPutDownAnywhere(matcher) {
        const matchingCardsInZone = this.getCardsInZone().map(c => this.createBehaviourCard(c)).filter(matcher);
        const matchingCardsInOpponentZone = this.getCardsInOpponentZone().map(c => this.createBehaviourCard(c)).filter(matcher);
        const matchingDiscardedCards = this.getDiscardedCards().map(c => this.createBehaviourCard(c)).filter(matcher);
        const matchingStationCards = this.getStationCards().filter(s => !!s.card).map(s => this._cardDataFromStationCard(s)).map(c => this.createBehaviourCard(c)).filter(matcher);
        return [...matchingCardsInZone, ...matchingCardsInOpponentZone, ...matchingDiscardedCards, ...matchingStationCards];
    }

    getMatchingBehaviourCardsFromZoneOrStation(matcher) {
        const matchingStationCards = this.getStationCards().filter(s => !!s.card).map(s => this._cardDataFromStationCard(s)).map(c => this.createBehaviourCard(c)).filter(matcher);
        return [...matchingStationCards, ...this.getMatchingBehaviourCards(matcher)];
    }

    getMatchingPlayableBehaviourCards(matcher) {
        const matchingCardsOnHand = this.getCardsOnHand()
            .map(c => this.createBehaviourCard(c))
            .filter(c => c.canBePlayed())
            .filter(matcher);
        const matchingCardsAmongFlippedStationCards = this.getFlippedStationCards()
            .map(c => this.createBehaviourCard(c))
            .filter(c => c.canBePlayed())
            .filter(matcher);
        return [...matchingCardsOnHand, ...matchingCardsAmongFlippedStationCards];
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

    getStationCardCount() {
        return this.getStationCards().length;
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
        return this.getUnflippedStationCards().length;
    }

    getUnflippedStationCards() {
        const playerState = this.getPlayerState();
        return playerState.stationCards.filter(s => !s.flipped);
    }

    allowedStartingStationCardCount() {
        const stationCardsAtStart = this._gameConfig.stationCardsAtStart();
        return this.isFirstPlayer() ? stationCardsAtStart : stationCardsAtStart + 1;
    }

    getFlippedStationCards() {
        const playerState = this.getPlayerState();
        return playerState.stationCards.filter(s => s.flipped);
    }

    hasFlippedStationCards() {
        return this.getFlippedStationCards().length > 0;
    }

    getEvents() {
        return this
            .getPlayerState()
            .events;
    }

    getStationDrawCardsCount() {
        const stationCards = this.getStationCards();
        return stationCards
            .filter(card => card.place === 'draw')
            .length;
    }

    getDeck() {
        const state = this.getPlayerState();
        const cardsInDeck = this._deckFactory.create(state.cardsInDeck);
        return cardsInDeck;
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

    isCardInHomeZone(cardId) {
        return this.getPlayerState().cardsInZone.some(c => c.id === cardId);
    }

    isCardStationCard(cardId) {
        return this.getPlayerState().stationCards.some(s => getStationCardId(s) === cardId);
    }

    isCardFlipped(cardId) {
        const stationCard = this.findStationCard(cardId);
        return stationCard && stationCard.flipped;
    }

    findStationCard(cardId) {
        const playerState = this.getPlayerState();
        return this._findStationCardFromCollection(cardId, playerState.stationCards);
    }

    _findStationCardFromCollection(cardId, collection) {
        return collection.find(stationCard => getStationCardId(stationCard) === cardId);
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
        if (cardInStation) return this._cardDataFromStationCard(cardInStation);

        const cardOnHand = playerState.cardsOnHand.find(c => c.id === cardId);
        if (cardOnHand) return cardOnHand;

        const discardedCard = playerState.discardedCards.find(c => c.id === cardId);
        if (discardedCard) return discardedCard;

        return null;
    }

    findCardFromZonesOrStation(cardId) {
        const playerState = this.getPlayerState();

        const cardInZone = playerState.cardsInZone.find(c => c.id === cardId);
        if (cardInZone) return cardInZone;

        const cardInOpponentZone = playerState.cardsInOpponentZone.find(c => c.id === cardId);
        if (cardInOpponentZone) return cardInOpponentZone;

        const cardInStation = playerState.stationCards.find(s => getStationCardId(s) === cardId);
        if (cardInStation) return this._cardDataFromStationCard(cardInStation);

        return null;
    }


    nameOfCardSource(cardId) {
        const playerState = this.getPlayerState();

        const cardInZone = playerState.cardsInZone.find(c => c.id === cardId);
        if (cardInZone) return 'zone';

        const cardInStation = playerState.stationCards.find(s => getStationCardId(s) === cardId);
        if (cardInStation) return 'station-' + cardInStation.place;

        const cardOnHand = playerState.cardsOnHand.find(c => c.id === cardId);
        if (cardOnHand) return 'hand';

        return 'other';
    }

    findCardFromHandOrStation(cardId) {
        const playerState = this.getPlayerState();

        const cardInStation = playerState.stationCards.find(s => getStationCardId(s) === cardId);
        if (cardInStation) return this._cardDataFromStationCard(cardInStation);

        const cardOnHand = playerState.cardsOnHand.find(c => c.id === cardId);
        if (cardOnHand) return cardOnHand;

        return null;
    }

    setPhase(phase) {
        this.update(playerState => {
            playerState.phase = phase;
        });
    }

    addStationCard(cardData, location, {startingStation = false, putDownAsExtraStationCard = false} = {}) {
        const stationLocation = location.split('-').pop();
        const stationCard = {place: stationLocation, card: cardData};
        this.update(playerState => {
            playerState.stationCards.push(stationCard);
        });
        const currentTurn = this._matchService.getTurn();
        this.storeEvent(PutDownCardEvent({
            turn: currentTurn,
            location,
            cardId: cardData.id,
            cardCommonId: cardData.commonId,
            putDownAsExtraStationCard,
            startingStation
        }));
        return stationCard;
    }

    addCardToHand(cardData) {
        this.update(playerState => {
            playerState.cardsOnHand.push(cardData);
        });
        this.storeEvent(AddCardToHandEvent({cardId: cardData.id}));
    }

    putDownCardInZone(cardData, {grantedForFreeByEvent = false} = {}) {
        this.update(playerState => {
            playerState.cardsInZone.push(cardData);
        });
        this.registerEventForPutDownCardInZone(cardData, {grantedForFreeByEvent});
    }

    registerEventForPutDownCardInZone(cardData, {grantedForFreeByEvent = false} = {}) {
        const currentTurn = this._matchService.getTurn();
        this.storeEvent(PutDownCardEvent({
            turn: currentTurn,
            location: 'zone',
            cardId: cardData.id,
            cardCommonId: cardData.commonId,
            grantedForFreeByEvent
        }));
    }

    putDownEventCardInZone(cardData) {
        const card = this.createBehaviourCard(cardData);
        card.eventSpecsWhenPutDownInHomeZone
            .map(this._eventFactory.fromSpec)
            .forEach(event => {
                this.storeEvent(event);
            });

        this.registerEventForPutDownEventCardInZone(cardData);
        this.discardCard(cardData);
    }

    registerEventForPutDownEventCardInZone(cardData) {
        const currentTurn = this._matchService.getTurn();
        this.storeEvent(PutDownCardEvent({
            turn: currentTurn,
            location: 'zone',
            cardId: cardData.id,
            cardCommonId: cardData.commonId
        }));
    }

    removeAndDiscardCardFromStationOrZone(cardId) {
        const cardData = this.findCardFromAnySource(cardId);
        this.removeCardFromStationOrZones(cardId);
        this.discardCard(cardData);

        return cardData;
    }

    discardTopTwoCardsInDrawPile() { //TODO Correct name for this is operation is "Mill". Number of cards to be milled may now vary as of the config file.
        const deck = this.getDeck();
        if (deck.getCardCount() === 0) {
            this._logger.log(`PLAYERID=${this._playerId} Cannot mill, deck is empty`, 'playerStateService');
            return;
        }

        const millCardCount = this._gameConfig.millCardCount();
        const milledCards = this._drawCount(millCardCount);
        for (const card of milledCards) {
            this.discardCard(card);
        }

        return milledCards;
    }

    _drawCount(count) {
        let drawnCards;
        this.useDeck(deck => {
            drawnCards = deck.draw(count);
        });

        return drawnCards;
    }

    useToCounter(cardId) {
        const cardIsOnHandOrInStation = !!this.findCardFromHandOrStation(cardId);
        if (cardIsOnHandOrInStation) {
            this.registerCounterWithCardOnHandOrInStation(cardId);
        } else {
            this.registerCounterWithCardInZone(cardId);
        }
    }

    registerCounterWithCardOnHandOrInStation(cardId) {
        const cardData = this.removeCardFromStationOrHand(cardId);
        if (cardData.type === 'event') {
            this.registerEventForPutDownEventCardInZone(cardData);
        } else {
            this.registerEventForPutDownCardInZone(cardData, {grantedForFreeByEvent: false});
        }

        this.discardCard(cardData);
    }

    registerCounterWithCardInZone(cardId) {
        const cardData = this.removeCardFromHomeZone(cardId);
        this.discardCard(cardData);
    }

    registerAttackCountered({attackerCardId, defenderCardId = null, targetStationCardIds = null}) {
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
        const cardData = this.removeCardFromAnySource(cardId);
        this.discardCard(cardData);
        this.storeEvent({
            type: 'counterCard',
            turn: this._matchService.getTurn(),
            counteredCardCommonId: cardData.commonId,
        });
    }

    discardCard(cardData) {
        const turn = this._matchService.getTurn();

        if (cardData.damage) {
            cardData.damage = 0;
        }

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

    drawCard({byEvent = false} = {}) {
        const deck = this.getDeck();
        if (deck.getCardCount() === 0) {
            this._logger.log(`PLAYERID=${this._playerId} Cannot draw card, deck is empty`, 'playerStateService');
            return;
        }

        const cards = this._drawCount(1);
        for (const card of cards) {
            this.addCardToHand(card)
        }

        const turn = this._matchService.getTurn();
        this.storeEvent(DrawCardEvent({turn, byEvent}));
    }

    registerMill({byEvent = false} = {}) {
        if (!byEvent) {
            const turn = this._matchService.getTurn();
            this.storeEvent(new DrawCardEvent({turn}));
        }
    }

    registerAttack({attackerCardId, defenderCardId = null, targetStationCardIds = null}) {
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
            this.storeEvent(MoveCardEvent({turn, cardId, cardCommonId: updatedCardCommonId}));
        } else {
            throw new Error(`Failed to move card with ID: ${cardId}`);
        }
    }

    flipStationCard(cardId) {
        this.updateStationCard(cardId, card => {
            card.flipped = true;
        });
    }

    unflipStationCard(cardId) {
        this.updateStationCard(cardId, card => {
            card.flipped = false;
        });
    }

    removeCardFromAnySource(cardId) {
        let removedCard;

        removedCard = this.removeCardFromStationOrHand(cardId);
        if (removedCard) return removedCard;

        removedCard = this.removeCard(cardId);
        if (removedCard) return removedCard;

        removedCard = this.removeCardFromDiscardPile(cardId);
        if (removedCard) return removedCard;

        return this.removeCardFromDeck(cardId);
    }

    removeCardFromStationOrZones(cardId) {
        if (this.findStationCard(cardId)) {
            const removedStationCard = this.removeStationCard(cardId);
            return this._cardDataFromStationCard(removedStationCard);
        } else if (this.findCard(cardId)) {
            return this.removeCard(cardId);
        }
        return null;
    }

    removeCardFromStationOrHand(cardId) {
        if (this.findStationCard(cardId)) {
            const removedStationCard = this.removeStationCard(cardId);
            return this._cardDataFromStationCard(removedStationCard);
        } else if (this.findCardFromHand(cardId)) {
            return this.removeCardFromHand(cardId);
        }
        return null;
    }

    removeCardFromStationHandOrHomeZone(cardId) {
        if (this.findStationCard(cardId)) {
            const removedStationCard = this.removeStationCard(cardId);
            return this._cardDataFromStationCard(removedStationCard);
        } else if (this.findCardFromHand(cardId)) {
            return this.removeCardFromHand(cardId);
        } else if (this.getCardsInZone().find(c => c.id === cardId)) {
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
        } else {
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
        const stationCard = this.findStationCard(cardId);
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
        let card;
        this.useDeck(deck => {
            card = deck.removeCard(cardId);
        });

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

    useDeck(updateFn) {
        const deck = this.getDeck();
        updateFn(deck);
        this.update(state => {
            state.cardsInDeck = deck.getAll();
        });
    }

    updateCardById(cardId, updateFn) {
        const playerState = this.getPlayerState();
        let zoneName;
        if (playerState.cardsInZone.find(c => c.id === cardId)) {
            zoneName = 'cardsInZone';
        } else if (playerState.cardsInOpponentZone.find(c => c.id === cardId)) {
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
            const stationCards = playerState.stationCards;
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
                emit({property, playerId});
                return true;
            },
            get(target, property) {
                emit({property, playerId});
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
        return this._getCardFactory().createCardForPlayer(cardData, this._playerId);
    }

    createBehaviourCard(cardData) {
        return this._getCardFactory().createCardForPlayer(cardData, this._playerId);
    }

    _getCardFactory() {
        if (typeof this._cardFactory === 'function') {
            return this._cardFactory();
        }
        return this._cardFactory;
    }

    _cardDataFromStationCard(stationCard) {
        return {
            ...stationCard.card,
            flipped: stationCard.flipped,
        };
    }
}

module.exports = PlayerStateService;

function getStationCardId(stationCard) {
    return stationCard.card ? stationCard.card.id : stationCard.id;
}

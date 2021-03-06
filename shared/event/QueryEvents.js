class QueryEvents {
  constructor({
    eventRepository,
    opponentEventRepository,
    matchService,
    getCurrentTime,
  }) {
    this._eventRepository = eventRepository;
    this._opponentEventRepository = opponentEventRepository;
    this._matchService = matchService;
    this._getCurrentTime = getCurrentTime;
  }

  hasMovedOnPreviousTurn(cardId, currentTurn) {
    const events = this._eventRepository.getAll();
    return (
      this._cardHasMoved(cardId, events) &&
      this._turnCountSinceMoveLast(cardId, currentTurn, events) > 0
    );
  }

  wasGrantedByFreeEventOnPreviousTurn(cardId, currentTurn) {
    try {
      const lastPutDownEventForCard = this.getPutDownEventForCard(cardId);
      return (
        lastPutDownEventForCard.grantedForFreeByEvent &&
        lastPutDownEventForCard.turn < currentTurn
      );
    } catch (e) {
      return false;
    }
  }

  wasGrantedByFreeEventOnPreviousTurnAtOpponentZone(cardId, currentTurn) {
    try {
      const lastPutDownEventForCard = this.getPutDownEventForCard(cardId);
      return (
        lastPutDownEventForCard.location !== "zone" &&
        lastPutDownEventForCard.grantedForFreeByEvent &&
        lastPutDownEventForCard.turn < currentTurn
      );
    } catch (e) {
      return false;
    }
  }

  hasMovedOnTurn(cardId, turn) {
    return this.getMovesOnTurn(cardId, turn).length > 0;
  }

  _cardHasMoved(cardId, events) {
    return events.some((e) => e.type === "moveCard" && e.cardId === cardId);
  }

  _turnCountSinceMoveLast(cardId, currentTurn, events) {
    const moveCardEvent = events
      .slice()
      .reverse()
      .find((e) => e.type === "moveCard" && e.cardId === cardId);
    return currentTurn - moveCardEvent.turn;
  }

  playerCardWasInHandAfterOpponentCardWasPlayed(playerCard, opponentCard) {
    const playerCardInHandAtTime = this._timeWhenCardWasLastPlacedInHand(
      playerCard.id,
      this._eventRepository.getAll()
    );
    const opponentCardDrawnAtTime = this._timeWhenCardWasLastPlayed(
      opponentCard.id,
      this._opponentEventRepository.getAll()
    );
    return playerCardInHandAtTime > opponentCardDrawnAtTime;
  }

  _timeWhenCardWasLastPlacedInHand(cardId, events) {
    const drawEvent = this._findAddCardToHandEvent(cardId, events);
    return drawEvent ? drawEvent.created : 0;
  }

  _findAddCardToHandEvent(cardId, events) {
    return events
      .slice()
      .reverse()
      .find((e) => e.type === "addCardToHand" && e.cardId === cardId);
  }

  _timeWhenCardWasLastPlayed(cardId, events) {
    const drawEvent = this._findLastPlayedCardEvent(cardId, events);
    return drawEvent ? drawEvent.created : 0;
  }

  _findLastPlayedCardEvent(cardId, events) {
    return events
      .slice()
      .reverse()
      .find(
        (e) =>
          e.type === "putDownCard" &&
          e.location === "zone" &&
          e.cardId === cardId
      );
  }

  putDownCardInHomeZoneCountOnTurn(turn) {
    const events = this._eventRepository.getAll();
    const putDownCardEvents = events.filter((event) => {
      return (
        event.turn === turn &&
        event.type === "putDownCard" &&
        event.location === "zone"
      );
    });
    return putDownCardEvents.length;
  }

  lastTookControlWithinTimeFrameSincePutDownCard(
    opponentCardId,
    millisecondsTimeFrame
  ) {
    const timeWhenOpponentCardWasPutDown = this.getTimeWhenOpponentCardWasPutDown(
      opponentCardId
    );
    const playerEvents = this._eventRepository.getAll().slice();

    const indexOfLatestTakingOfControl = findLastIndex(
      playerEvents,
      (e) => e.type === "takeControlOfOpponentsTurn"
    );
    const indexOfLatestReleaseOfControl = findLastIndex(
      playerEvents,
      (e) => e.type === "releaseControlOfOpponentsTurn"
    );

    if (indexOfLatestTakingOfControl > indexOfLatestReleaseOfControl) {
      const takeControlOfOpponentsTurnEvent =
        playerEvents[indexOfLatestTakingOfControl];
      const timeDifference =
        takeControlOfOpponentsTurnEvent.created -
        timeWhenOpponentCardWasPutDown;

      //NOTE!
      // You can counter cards where "timeDifference < 0". This is because you may counter a counter.
      return timeDifference <= millisecondsTimeFrame;
    }

    return false;
  }
  getTimeWhenCardsWasPutDownByCommonIdOrderByCreated(commonIds) {
    const opponentEvents = this._opponentEventRepository
      .getAll()
      .slice()
      .reverse();
    const playerEvents = this._eventRepository.getAll().slice().reverse();

    const putDownForPLayer = playerEvents.find((e) => {
      return (
        e.type === "putDownCard" &&
        commonIds.includes(e.cardCommonId) &&
        !e.grantedForFreeByEvent
      );
    });
    const putDownForOpponent = opponentEvents.find((e) => {
      return (
        e.type === "putDownCard" &&
        commonIds.includes(e.cardCommonId) &&
        !e.grantedForFreeByEvent
      );
    });
    if (putDownForPLayer && putDownForOpponent) {
      return putDownForPLayer.created > putDownForOpponent.created
        ? putDownForPLayer
        : putDownForOpponent;
    }
    if (putDownForPLayer) {
      return putDownForPLayer;
    }
    if (putDownForOpponent) {
      return putDownForOpponent;
    }
  }
  getTimeWhenOpponentCardWasPutDownByCommonId(commonId) {
    const events = this._opponentEventRepository.getAll().slice().reverse();
    const putDownEventForThisCard = events.find((e) => {
      return (
        e.type === "putDownCard" &&
        e.cardCommonId === commonId &&
        !e.grantedForFreeByEvent
      );
    });

    if (putDownEventForThisCard) {
      return putDownEventForThisCard.created;
    }
  }

  getTurnWhenCardDormantEffectWasUsed(id) {
    const events = this._eventRepository.getAll().slice().reverse();
    const putDownEventForThisCard = events.find((e) => {
      return e.type === "useDormantEffect" && e.cardId === id;
    });
    if (putDownEventForThisCard) {
      return putDownEventForThisCard.turn;
    }
  }

  getTimeWhenCardWasPutDownById(id) {
    const events = this._eventRepository.getAll().slice().reverse();

    const putDownEventForThisCard = events.find((e) => {
      return e.type === "putDownCard" && e.cardId === id;
    });
    if (putDownEventForThisCard) {
      return putDownEventForThisCard.created;
    }
    const opponentEvents = this._opponentEventRepository
      .getAll()
      .slice()
      .reverse();

    const putDownOpponentEventForThisCard = opponentEvents.find((e) => {
      return e.type === "putDownCard" && e.cardId === id;
    });
    if (putDownOpponentEventForThisCard) {
      return putDownOpponentEventForThisCard.created;
    }
  }

  putDownCardWithinTimeFrame(opponentCardId, millisecondsTimeFrame) {
    const timeWhenOpponentCardWasPutDown = this.getTimeWhenOpponentCardWasPutDown(
      opponentCardId
    );
    const timeSincePutDown =
      this._getCurrentTime() - timeWhenOpponentCardWasPutDown;
    return timeSincePutDown >= 0 && timeSincePutDown <= millisecondsTimeFrame;
  }

  getTimeWhenOpponentCardWasPutDown(opponentCardId) {
    const events = this._opponentEventRepository.getAll().slice().reverse();
    const putDownEventForThisCard = events.find((e) => {
      return e.type === "putDownCard" && e.cardId === opponentCardId;
    });
    if (!putDownEventForThisCard) {
      return this._matchService.getGameStartTime();
    }
    return putDownEventForThisCard.created;
  }

  wasOpponentCardAtLatestPutDownInHomeZone(opponentCardId) {
    const eventsInReverse = this._opponentEventRepository
      .getAll()
      .slice()
      .reverse();
    const event = eventsInReverse.find(
      (e) => e.type === "putDownCard" && e.cardId === opponentCardId
    );
    return event && event.location === "zone";
  }

  wasOpponentCardAtLatestPutDownAsExtraStationCard(opponentCardId) {
    const eventsInReverse = this._opponentEventRepository
      .getAll()
      .slice()
      .reverse();
    const event = eventsInReverse.find(
      (e) => e.type === "putDownCard" && e.cardId === opponentCardId
    );

    return (
      event &&
      event.location.startsWith("station-") &&
      event.putDownAsExtraStationCard
    );
  }

  getTurnWhenCardWasPutDown(cardId) {
    return this.getPutDownEventForCard(cardId).turn;
  }

  getPutDownEventForCard(cardId) {
    const eventsInReverse = this._eventRepository.getAll().slice().reverse();
    const lastPutDownEventForCard = eventsInReverse.find((e) => {
      return e.type === "putDownCard" && e.cardId === cardId;
    });
    if (!lastPutDownEventForCard)
      throw new Error(
        `Asking when card (${cardId}) was put down. But card has not been put down.`
      );
    return lastPutDownEventForCard;
  }
  getAttacksOnTurn(cardId, turn) {
    const events = this._eventRepository.getAll();
    return events.filter((event) => {
      return (
        event.turn === turn &&
        event.type === "attack" &&
        event.attackerCardId === cardId
      );
    });
  }

  getRepairsOnTurn(cardId, turn) {
    const events = this._eventRepository.getAll();
    return events.filter((event) => {
      return (
        event.turn === turn &&
        event.type === "repairCard" &&
        event.cardId === cardId
      );
    });
  }

  getMovesOnTurn(cardId, turn) {
    const events = this._eventRepository.getAll();
    return events.filter((event) => {
      return (
        event.turn === turn &&
        event.type === "moveCard" &&
        event.cardId === cardId
      );
    });
  }
  countRegularStationCardsPutDownOnTurn(turn) {
    return this._eventRepository.getAll().filter((e) => {
      return (
        e.turn === turn &&
        e.type === "putDownCard" &&
        e.location.startsWith("station") &&
        !e.putDownAsExtraStationCard &&
        !e.startingStation
      );
    }).length;
  }

  countFreeExtraStationCardsGrantedOnTurn(turn) {
    return this._eventRepository
      .getAll()
      .filter((e) => {
        return e.turn === turn && e.type === "freeExtraStationCardGranted";
      })
      .reduce((acc, event) => {
        return acc + event.count;
      }, 0);
  }

  getCardDrawsOnTurn(turn, { byEvent = false } = {}) {
    const events = this._eventRepository.getAll();
    return events.filter((event) => {
      return (
        event.turn === turn &&
        event.type === "drawCard" &&
        event.byEvent === byEvent
      );
    });
  }

  countReplaces() {
    const events = this._eventRepository.getAll();
    const replaces = events.filter((event) => event.type === "replaceCard");
    return replaces.length;
  }

  countReplacesOnTurn(currentTurn) {
    const events = this._eventRepository.getAll();
    const replaces = events.filter(
      (event) => event.turn === currentTurn && event.type === "replaceCard"
    );
    return replaces.length;
  }

  costOfFatalErrorUsed(cardId) {
    return this._eventRepository
      .getAll()
      .slice()
      .reverse()
      .filter(
        (event) =>
          event.type === "FatalErrorUsedEvent" && event.cardId === cardId
      )[0];
  }
}

function findLastIndex(collection, selector) {
  const indexInReverseCollection = collection
    .slice()
    .reverse()
    .findIndex(selector);
  if (indexInReverseCollection === -1) return -1;
  return collection.length - 1 - indexInReverseCollection;
}

module.exports = QueryEvents;

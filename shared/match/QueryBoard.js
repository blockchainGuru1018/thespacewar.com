const TargetMissed = require("../card/TargetMissed");

class QueryBoard {
  constructor({
    opponentStateService,
    playerStateService,
    canThePlayer,
    queryAttacks,
  }) {
    this._opponentStateService = opponentStateService;
    this._playerStateService = playerStateService;
    this._canThePlayer = canThePlayer;
    this._queryAttacks = queryAttacks;
  }

  opponentHasCardInPlay(matcher) {
    return this._opponentStateService.hasMatchingCardInSomeZone(matcher);
  }

  playerHasCardThatCanCounter() {
    const playerCardsOnHand = this._playerStateService
      .getCardsOnHand()
      .map((cardData) =>
        this._playerStateService.createBehaviourCard(cardData)
      );
    const playerCardsInPlay = this._playerStateService
      .getCardsInZone()
      .map((cardData) =>
        this._playerStateService.createBehaviourCard(cardData)
      );

    const possibleSourceOfCounterCards = [
      ...playerCardsOnHand,
      ...playerCardsInPlay,
    ];

    const discardAndInGameOpponentCards = [
      ...this._opponentStateService.getCardsInZone(),
      ...this._opponentStateService.getDiscardedCards(),
    ].map((cardData) =>
      this._opponentStateService.createBehaviourCard(cardData)
    );

    for (const playerCard of possibleSourceOfCounterCards) {
      for (const opponentCard of discardAndInGameOpponentCards) {
        if (playerCard.canCounterCard(opponentCard)) {
          return this._canThePlayer.cardItsOnTheTimeIntervalToCounter(
            opponentCard.getCardData().id
          );
        }
      }
    }
    return false;
  }

  playerHasCardThatCanCounterAttack() {
    return (
      this._queryAttacks.attackEventOnTheTimeIntervalToCounter() &&
      this._haveTargetMissedOnHand()
    );
  }

  _haveTargetMissedOnHand() {
    return [
      ...this._playerStateService.getCardsOnHand(),
      ...this._playerStateService
        .getFlippedStationCards()
        .map((stationCard) => stationCard.card),
    ].some((card) => card.commonId === TargetMissed.CommonId);
  }
}

module.exports = QueryBoard;

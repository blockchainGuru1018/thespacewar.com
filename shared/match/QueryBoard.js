class QueryBoard {
  constructor({opponentStateService}) { // TODO Add playerStateService as a dependency
    this._opponentStateService = opponentStateService;
    // this._playerStateService = playerStateService;
  }

  opponentHasCardInPlay(matcher) {
    return this._opponentStateService.hasMatchingCardInSomeZone(matcher);
  }

  // playerHasCardThatCanCounter() {
  //   const playerCards = this._playerStateService
  //     .getCardsOnHand()
  //     .map((cardData) =>
  //       this._playerStateService.createBehaviourCard(cardData)
  //     );
  //   const opponentCardDatas = this._opponentStateService.findCardFromZonesAndDiscardPile();
  //   for (const playerCard of playerCards) {
  //     if (playerCard.canCounterCard(opponentCard)) {
  //       for (const opponentCard of opponentCardDatas) {
  //         return canThePlayer.counterCard(opponentCard);
  //       }
  //     } else if (playerCard.canCounterAttacks) {
  //       return queryAttacks.canBeCountered().lenght > 0;
  //     }
  //   }
  //
  //   return false;
  // }
}

module.exports = QueryBoard;

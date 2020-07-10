class QueryBoard {
  constructor({ opponentStateService }) {
    this._opponentStateService = opponentStateService;
  }

  opponentHasCardInPlay(matcher) {
    return this._opponentStateService.hasMatchingCardInSomeZone(matcher);
  }
}

module.exports = QueryBoard;

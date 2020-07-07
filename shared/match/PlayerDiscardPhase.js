const CheatError = require("../../server/match/CheatError.js");

module.exports = function ({ playerRuleService, playerStateService }) {
  return {
    canLeavePhase,
    leavePhase,
  };

  function canLeavePhase() {
    return hasDiscardedEnoughCards();
  }

  function leavePhase() {
    if (!hasDiscardedEnoughCards()) {
      throw new CheatError(
        "Cannot leave the discard phase without discarding enough cards"
      ); //TODO SHOULD NOT THROW HERE?! Should check before executing code if its possible to do this.
    }
  }

  function hasDiscardedEnoughCards() {
    const maxHandSize = playerRuleService.getMaximumHandSize();
    return playerStateService.getCardsOnHandCount() <= maxHandSize;
  }
};

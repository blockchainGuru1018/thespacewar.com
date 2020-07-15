module.exports = function ({
  playerId,
  matchService,
  playerTurnControl,
  opponentTurnControl,
  playerStateService,
  queryPlayerRequirements,
}) {
  return {
    start,
    canStart,
  };

  function start() {
    const started = playerStateService.isBot()
      ? Date.now() - 14500
      : Date.now();
    matchService.update((state) => {
      state.lastStandInfo = { playerId, started: started };
    });

    if (playerTurnControl.opponentHasControlOfPlayersTurn()) {
      opponentTurnControl.releaseControlOfOpponentsTurn();
    } else if (playerTurnControl.opponentHasControlOfOwnTurn()) {
      playerTurnControl.takeControlOfOpponentsTurn();
    }
  }

  function canStart() {
    if (playerStateService.isBot() && !canAvoidStationCardAttack())
      return false;
    const allStationCardsAreDamaged =
      playerStateService.getUnflippedStationCardsCount() === 0;
    return allStationCardsAreDamaged && canAvoidStationCardAttack();
  }

  function canAvoidStationCardAttack() {
    const cardsCanBeUsedToCounter = playerStateService.getMatchingPlayableBehaviourCards(
      (card) => {
        return card.canCounterCardsBeingPlayed || card.canCounterAttacks;
      }
    );
    const isCurrentlyUsingCounter =
      queryPlayerRequirements.getFirstMatchingRequirement({
        type: "counterCard",
      }) ||
      queryPlayerRequirements.getFirstMatchingRequirement({
        type: "counterAttack",
      });
    return cardsCanBeUsedToCounter.length > 0 || isCurrentlyUsingCounter;
  }
};

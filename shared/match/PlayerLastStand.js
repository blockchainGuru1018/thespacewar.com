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
        canStart
    };

    function start() {
        matchService.update(state => {
            state.lastStandInfo = { playerId, started: Date.now() };
        });

        if (playerTurnControl.opponentHasControlOfPlayersTurn()) {
            opponentTurnControl.releaseControlOfOpponentsTurn();
        }
        else if (playerTurnControl.opponentHasControlOfOwnTurn()) {
            playerTurnControl.takeControlOfOpponentsTurn();
        }
    }

    function canStart() {
      console.log("playerStateService.isBot(): ", playerStateService.isBot());
      if (playerStateService.isBot()) return false;
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

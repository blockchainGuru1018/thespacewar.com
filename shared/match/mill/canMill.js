module.exports = function ({
  isWaitingOnOpponentFinishingRequirement,
  opponentDeckIsEmpty,
  playerHasTheMiller,
  firstRequirementIsDrawCard,
  moreCardsCanBeDrawnForDrawPhase,
}) {
  if (isWaitingOnOpponentFinishingRequirement) return false;
  if (opponentDeckIsEmpty) return false;

  if (!playerHasTheMiller) return false;

  return firstRequirementIsDrawCard || moreCardsCanBeDrawnForDrawPhase;
};

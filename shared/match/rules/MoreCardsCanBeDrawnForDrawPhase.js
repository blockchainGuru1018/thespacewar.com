//TODO Name can be confusing. It only refers to the number of cards you have drawn compared to
// the number of draw-row station cards you have. It does NOT take into account the amount
// of cards left in your deck for example.
module.exports = function MoreCardsCanBeDrawnForDrawPhase({
  playerPhase,
  countCardsLeftToDrawForDrawPhase,
}) {
  return () => {
    return playerPhase.isDraw() && countCardsLeftToDrawForDrawPhase() > 0;
  };
};

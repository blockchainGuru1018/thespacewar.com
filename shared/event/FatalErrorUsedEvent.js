function FatalErrorUsed({
  turn,
  phase,
  targetCardCommonId,
  targetCardCost,
  cardId,
}) {
  return {
    type: FatalErrorUsed.Type,
    created: Date.now(),
    turn,
    phase,
    targetCardCommonId,
    targetCardCost,
    cardId,
  };
}

FatalErrorUsed.Type = "fatalErrorUsed";

module.exports = FatalErrorUsed;

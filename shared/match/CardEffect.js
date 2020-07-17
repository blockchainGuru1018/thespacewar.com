module.exports = function ({ canThePlayer, playerStateService }) {
  return {
    attackBoostForCardType,
    cardTypeCanMoveOnTurnPutDown,
    costCardIncrement,
  };

  function attackBoostForCardType(type) {
    if (type !== "spaceShip") return 0;

    return sum(attackBoostForEachDurationCard());
  }

  function costCardIncrement() {
    return sum(costCardIncrementForEachDurationCard());
  }

  function costCardIncrementForEachDurationCard() {
    return playerStateService
      .getMatchingBehaviourCardsInBoard(
        (card) => card.allCardsCostIncrementEffect
      )
      .map((c) => c.allCardsCostIncrementEffect);
  }
  function cardTypeCanMoveOnTurnPutDown(type) {
    if (type !== "spaceShip") return false;

    return cardsWithEffectToMoveTurnWhenPutDown().length > 0;
  }

  function cardsWithEffectToMoveTurnWhenPutDown() {
    return usableDurationCards().filter(
      (c) => c.allowsFriendlySpaceShipsToMoveTurnWhenPutDown
    );
  }

  function attackBoostForEachDurationCard() {
    return usableDurationCards()
      .filter((c) => c.friendlySpaceShipAttackBonus)
      .map((c) => c.friendlySpaceShipAttackBonus);
  }

  function usableDurationCards() {
    return playerStateService
      .getDurationBehaviourCards()
      .filter((c) => canThePlayer.useThisDurationCard(c.id));
  }

  function sum(list) {
    return list.reduce((acc, v) => acc + v, 0);
  }
};

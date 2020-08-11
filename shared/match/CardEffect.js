module.exports = function ({ canThePlayer, playerStateService }) {
  return {
    attackBoostForCardType,
    cardTypeCanMoveOnTurnPutDown,
    costCardIncrement,
    canCollideForDurationCard,
    attackBoostForCollision,
  };

  function attackBoostForCardType(type, usingCollision = false) {
    if (type !== "spaceShip") return 0;

    return sum(attackBoostForEachDurationCard(usingCollision));
  }

  function costCardIncrement() {
    return sum(costCardIncrementForEachDurationCard());
  }

  function costCardIncrementForEachDurationCard() {
    return playerStateService
      .getMatchingBehaviourCardsInBoard(
        (card) => card.allCardsCostIncrementEffect
      )
      .filter((card) => canThePlayer.useThisCard(card))
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

  function attackBoostForCollision(usingCollision) {
    const cardsWithCollideForDurationCard = getCardsForCollideForDurationCard();
    if (cardsWithCollideForDurationCard.length > 0 && usingCollision) {
      return cardsWithCollideForDurationCard[0].attackBonus;
    } else {
      return 0;
    }
  }

  function getCardsForCollideForDurationCard() {
    return playerStateService
      .getDurationBehaviourCards()
      .filter((c) => c.canCollide);
  }
  function canCollideForDurationCard() {
    return (
      (
        playerStateService
          .getDurationBehaviourCards()
          .filter((c) => c.canCollide) || []
      ).length > 0
    );
  }
};

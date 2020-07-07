module.exports = function MoveCardCapability({ card, matchController }) {
  return {
    canDoIt,
    doIt,
  };

  function canDoIt() {
    return (
      card.canMove() &&
      card.isInHomeZone() &&
      !card.canAttackCardsInOtherZone() &&
      card.attack > 0
    );
  }

  function doIt() {
    matchController.emit("moveCard", card.id);
  }
};

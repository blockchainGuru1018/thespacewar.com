const Fusion = require("../../../shared/card/Fusion.js");
const Carrier = require("../../../shared/card/Carrier.js");

const DEFAULT_BLACKLIST = [Fusion.CommonId, Carrier.CommonId];
module.exports = function MoveCardCapability({
  card,
  matchController,
  blackList = DEFAULT_BLACKLIST,
}) {
  return {
    canDoIt,
    doIt,
  };

  function canDoIt() {
    return (
      !blackList.includes(card.commonId) &&
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

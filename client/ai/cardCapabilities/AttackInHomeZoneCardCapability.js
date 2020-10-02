const TheParalyzer = require("../../../shared/card/TheParalyzer.js");
const ToxicGas = require("../../../shared/card/ToxicGas.js");
const attackBiggestShipPriority = require("./priorities/AttackBiggestShipPriority.js");
const BLACK_LIST_CARDS = [ToxicGas.CommonId];
const SpecificCapabilitiesInPriorityOrder = new Map();
SpecificCapabilitiesInPriorityOrder.set(
  TheParalyzer.CommonId,
  attackBiggestShipPriority()
);
module.exports = function AttackInHomeZoneCardCapability({
  card,
  matchController,
  opponentStateService,
}) {
  return {
    canDoIt,
    doIt,
  };

  function canDoIt() {
    return (
      !card.canAttackStationCards() &&
      hasAvailableTargets() &&
      !BLACK_LIST_CARDS.includes(card.commonId)
    );
  }

  function doIt() {
    matchController.emit("attack", {
      attackerCardId: card.id,
      defenderCardId: firstTarget(),
    });
  }

  function hasAvailableTargets() {
    return targets(card).length > 0;
  }

  function firstTarget() {
    const availableTargets = targets(card);
    const priority = SpecificCapabilitiesInPriorityOrder.get(card.commonId);
    if (priority !== undefined) {
      return priority(availableTargets);
    }
    return availableTargets[0].id;
  }

  function targets(playerCard) {
    return opponentStateService.getMatchingBehaviourCards((opponentCard) =>
      playerCard.canAttackCard(opponentCard)
    );
  }
};

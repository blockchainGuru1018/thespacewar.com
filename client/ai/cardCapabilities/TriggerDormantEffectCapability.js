const Carrier = require("../../../shared/card/Carrier.js");
const Fusion = require("../../../shared/card/Fusion");

module.exports = function TriggerDormantEffectCapability({
  card,
  matchController,
}) {
  const dormantEffetTriggersCard = [Carrier.CommonId, Fusion.CommonId];
  return {
    canDoIt,
    doIt,
  };

  function canDoIt() {
    return (
      card.canTriggerDormantEffect() &&
      dormantEffetTriggersCard.includes(card.commonId)
    );
  }

  function doIt() {
    matchController.emit("triggerDormantEffect", card.id);
  }
};

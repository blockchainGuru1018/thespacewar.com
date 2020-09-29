const Carrier = require("../../../shared/card/Carrier.js");

module.exports = function TriggerDormantEffectCapability({
  card,
  matchController,
}) {
  const dormantEffetTriggersCard = [Carrier.CommonId];
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

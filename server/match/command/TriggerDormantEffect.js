const UseDormantEffectEvent = require("../../../shared/event/UseDormantEffectEvent.js");
module.exports = function ({ matchService, playerStateService, canThePlayer }) {
  return (cardId) => {
    const card = playerStateService.createBehaviourCardById(cardId);
    if (canThePlayer.triggerCardsDormantEffect(card)) {
      card.triggerDormantEffect();
      const turn = matchService.getTurn();
      const event = UseDormantEffectEvent({ turn, cardId });
      playerStateService.storeEvent(event);
    }
  };
};

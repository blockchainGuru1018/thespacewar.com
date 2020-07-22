const CheatError = require("../CheatError.js");

module.exports = function ({
  playerServiceProvider,
  playerServiceFactory,
  playerRequirementUpdaterFactory,
}) {
  return {
    onSelectCard,
  };

  //TODO Should check if selected card is present in the requirement. (too safe guard against cheating)
  function onSelectCard(playerId, payload) {
    const selectedCardsCount = payload.targetIds.length;
    validateIfCanProgressRequirementByCount(selectedCardsCount, playerId);
    progressRequirementByCount(selectedCardsCount, playerId);
    moveCardsToDiscardPile(payload.targetIds, playerId);
  }

  function moveCardsToDiscardPile(cards, playerId) {
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );

    const cardCommonIds = [];
    for (const cardId of cards) {
      const cardData = playerStateService.removeCardFromAnySource(cardId);
      cardCommonIds.push(cardData.commonId);
      playerStateService.discardCard(cardData);
    }

    const playerActionLog = playerServiceFactory.actionLog(playerId);
    playerActionLog.cardsDiscarded({ cardCommonIds });
  }

  function validateIfCanProgressRequirementByCount(count, playerId) {
    const playerRequirementUpdater = playerRequirementUpdaterFactory.create(
      playerId,
      { type: "sacrifice" }
    );
    const canProgressRequirement = playerRequirementUpdater.canProgressRequirementByCount(
      count
    );
    if (!canProgressRequirement) {
      throw new CheatError("Cannot select more cards than required");
    }
  }
  function progressRequirementByCount(count, playerId) {
    const playerRequirementUpdater = playerRequirementUpdaterFactory.create(
      playerId,
      { type: "sacrifice" }
    );
    playerRequirementUpdater.progressRequirementByCount(count);
  }
};

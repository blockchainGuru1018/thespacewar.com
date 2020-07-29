const { PHASES } = require("../../shared/phases.js");

module.exports = function ({
  playerStateService,
  matchController,
  playCardCapability,
  decideRowForStationCard,
  decideCardToPlaceAsStationCard,
  playerRuleService,
  playerServiceFactory,
}) {
  return {
    decide,
  };

  function decide() {
    if (playCardCapability.canDoIt()) {
      playCardCapability.doIt();
    } else if (shouldPutDownStationCard()) {
      const stationRow = decideRowForStationCard();
      const location = "station-" + stationRow;
      const cardId = decideCardToPlaceAsStationCard();
      matchController.emit("putDownCard", { cardId, location });
    } else {
      if (
        playerServiceFactory
          .findDronesForZuuls("BOT")
          .canIssueFindDronesForZuuls()
      ) {
        matchController.emit("findDronesForZuuls");
      }
      matchController.emit("nextPhase", { currentPhase: PHASES.action });
    }
  }

  function shouldPutDownStationCard() {
    const cardsOnHand = playerStateService.getCardsOnHand();

    return (
      playerRuleService.canPutDownStationCards() &&
      playerRuleService.canPutDownMoreStationCardsThisTurn() &&
      cardsOnHand.length
    );
  }
};

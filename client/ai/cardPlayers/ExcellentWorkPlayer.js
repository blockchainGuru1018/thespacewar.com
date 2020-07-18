const ExcellentWork = require("../../../shared/card/ExcellentWork.js");

module.exports = function ({
  matchController,
  decideRowForStationCard,
  playerRuleService,
}) {
  return {
    forCard,
    play,
  };

  function forCard(card) {
    return card.commonId === ExcellentWork.CommonId;
  }

  function play(card) {
    if (playerRuleService.hasReachedMaximumStationCardCapacity()) {
      playToDrawExtraCards(card);
    } else {
      playAsExtraStationCard(card);
    }
  }

  function playToDrawExtraCards(card) {
    matchController.emit("putDownCard", {
      cardCost: card.cost + (card.costInflation || 0),
      cardId: card.id,
      location: "zone",
      choice: "draw",
    });
  }

  function playAsExtraStationCard(card) {
    matchController.emit("putDownCard", {
      cardCost: card.cost + (card.costInflation || 0),
      cardId: card.id,
      location: stationLocation(),
      choice: "putDownAsExtraStationCard",
    });
  }

  function stationLocation() {
    return `station-${decideRowForStationCard()}`;
  }
};

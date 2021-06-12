const CheatError = require("./CheatError.js");
const failIfThrows = require("./failIfThrows.js");

module.exports = function ({
  card,
  playerStateService,
  playerRuleService,
  queryPlayerRequirements,
}) {
  return ({ withError = false }) => {
    if (withError) return check();
    return failIfThrows(check);
  };

  function check() {
    const nameOfCardSource = playerStateService.nameOfCardSource(card.id);
    const isInStation = nameOfCardSource.startsWith("station");
    const isInHand = nameOfCardSource !== "hand";

    const moveToStationCardRequirement = queryPlayerRequirements.getFirstMatchingRequirement(
      { type: "moveCardToStationZone" }
    );
    if (
      (!moveToStationCardRequirement && isInHand && !isInStation) ||
      (moveToStationCardRequirement &&
        moveToStationCardRequirement.cardData.id !== card.id)
    ) {
      throw new CheatError("Cannot move card from zone to station");
    }

    if (!playerRuleService.canPutDownStationCards()) {
      throw new CheatError("Cannot put down card");
    }

    if (
      !card.canBePutDownAsExtraStationCard &&
      !playerRuleService.canPutDownMoreStationCardsThisTurn()
    ) {
      throw new CheatError("Cannot put down more station cards this turn");
    }
  }
};

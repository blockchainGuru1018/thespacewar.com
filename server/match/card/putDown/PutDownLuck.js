const Luck = require("../../../../shared/card/Luck.js");

PutDownLuck.CommonId = Luck.CommonId;

function PutDownLuck({ playerServiceProvider, playerServiceFactory }) {
  return {
    forPlayer,
  };

  function forPlayer(playerId, cardData, { choice }) {
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    playerStateService.putDownEventCardInZone(cardData);

    const addRequirementFromSpec = playerServiceFactory.addRequirementFromSpec(
      playerId
    );
    addRequirementFromSpec.forCardAndChoiceOfRequirement(cardData, choice);
  }
}

module.exports = PutDownLuck;

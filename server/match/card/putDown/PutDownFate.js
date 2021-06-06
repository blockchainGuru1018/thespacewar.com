const Fate = require("../../../../shared/card/Fate.js");

PutDownFate.CommonId = Fate.CommonId;

function PutDownFate({ playerServiceProvider, playerServiceFactory }) {
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

module.exports = PutDownFate;

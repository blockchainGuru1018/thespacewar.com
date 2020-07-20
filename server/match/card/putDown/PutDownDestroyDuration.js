const DestroyDuration = require("../../../../shared/card/DestroyDuration.js");

PutDownDestroyDuration.CommonId = DestroyDuration.CommonId;

function PutDownDestroyDuration({
  playerServiceProvider,
  playerServiceFactory,
}) {
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

module.exports = PutDownDestroyDuration;

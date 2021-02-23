const DeployStarship = require("../../../../shared/card/DeployStarship" +
  ".js");

PutDownDeployStarship.CommonId = DeployStarship.CommonId;

function PutDownDeployStarship({
  playerServiceProvider,
  playerServiceFactory,
}) {
  return {
    forPlayer,
  };

  function forPlayer(playerId, cardData) {
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const addRequirementFromSpec = playerServiceFactory.addRequirementFromSpec(
      playerId
    );
    playerStateService.putDownEventCardInZone(cardData);
    addRequirementFromSpec.forCardPutDownInHomeZone(cardData);
  }
}

module.exports = PutDownDeployStarship;

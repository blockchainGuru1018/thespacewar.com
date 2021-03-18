module.exports = function ({ playerServiceFactory, }) {
    return {
        actionPointsForDrawExtraCard,
    };
  
    function actionPointsForDrawExtraCard(playerId) {
        const playerRequirementService = playerServiceFactory.playerRequirementService(
            playerId
          );
          playerRequirementService.addDrawCardRequirement({
              count:1,
          })
        playerServiceFactory.actionPointsForDrawExtraCardEventFactory(playerId).createAndStore();
    }
  };
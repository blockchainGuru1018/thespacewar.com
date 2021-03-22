module.exports = function ({ playerServiceFactory, 
}) {
    return {
        actionPointsForDrawExtraCard,
    };
  
    function actionPointsForDrawExtraCard(playerId) {
        if(playerServiceFactory.playerActionPointsCalculator(playerId).calculate() >= 2){
            const playerRequirementService = playerServiceFactory.playerRequirementService(
                playerId
            );
            playerRequirementService.addDrawCardRequirement({
                count:1,
            })
            playerServiceFactory.actionPointsForDrawExtraCardEventFactory(playerId).createAndStore();
        }
    }
  };
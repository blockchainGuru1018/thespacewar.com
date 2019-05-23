const PerfectPlan = require('../../../../shared/card/PerfectPlan.js');

PutDownPerfectPlan.CommonId = PerfectPlan.CommonId;

function PutDownPerfectPlan({
    playerServiceProvider,
    playerServiceFactory
}) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.putDownEventCardInZone(cardData);

        const addRequirementFromSpec = playerServiceFactory.addRequirementFromSpec(playerId);
        addRequirementFromSpec.forCardPutDownInHomeZone(cardData);
    }
}

module.exports = PutDownPerfectPlan;

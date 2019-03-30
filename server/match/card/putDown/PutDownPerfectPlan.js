const PerfectPlan = require('../../../../shared/card/PerfectPlan.js');

PutDownPerfectPlan.CommonId = PerfectPlan.CommonId;

function PutDownPerfectPlan({
    playerServiceProvider
}) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.putDownEventCardInZone(cardData);

        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        let spec = PerfectPlan.info.requirementSpecsWhenPutDownInHomeZone;
        playerRequirementService.addCardRequirementFromSpec(cardData, spec);
    }
}

module.exports = PutDownPerfectPlan;
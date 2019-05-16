const TargetMissed = require('../../../../shared/card/TargetMissed.js');

PutDownTargetMissed.CommonId = TargetMissed.CommonId;

function PutDownTargetMissed({
    playerServiceProvider
}) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.putDownEventCardInZone(cardData);

        const spec = TargetMissed.Info.requirementSpecsWhenPutDownInHomeZone;
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        playerRequirementService.addCardRequirementFromSpec({ cardData, spec });
    }
}

module.exports = PutDownTargetMissed;

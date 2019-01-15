const ExcellentWork = require('../../../../shared/card/ExcellentWork.js');

PutDownExcellentWork.CommonId = ExcellentWork.CommonId;

function PutDownExcellentWork({
    playerServiceProvider,
    matchService
}) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);

        playerStateService.putDownEventCardInZone(cardData);
        playerRequirementService.addDrawCardRequirement({ count: 3, cardCommonId: cardData.commonId });
    }
}

module.exports = PutDownExcellentWork;
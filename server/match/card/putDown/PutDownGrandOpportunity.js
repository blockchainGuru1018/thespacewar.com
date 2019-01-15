const GrandOpportunity = require('../../../../shared/card/GrandOpportunity.js');

PutDownGrandOpportunity.CommonId = GrandOpportunity.CommonId;

function PutDownGrandOpportunity({
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
        playerRequirementService.addDrawCardRequirement({ count: 6, cardCommonId: cardData.commonId });
        playerRequirementService.addDiscardCardRequirement({ count: 2, cardCommonId: cardData.commonId });
    }
}

module.exports = PutDownGrandOpportunity;
const GrandOpportunity = require('../../../../shared/card/GrandOpportunity.js');

PutDownGrandOpportunity.CommonId = GrandOpportunity.CommonId;

function PutDownGrandOpportunity({ playerServiceProvider }) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);

        playerStateService.putDownEventCardInZone(cardData);
        playerRequirementService.addDrawCardRequirement({ count: 5, cardCommonId: cardData.commonId });
        playerRequirementService.addDiscardCardRequirement({ count: 1, cardCommonId: cardData.commonId });
    }
}

module.exports = PutDownGrandOpportunity;
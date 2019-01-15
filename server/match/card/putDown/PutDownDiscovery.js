const Discovery = require('../../../../shared/card/Discovery.js');

PutDownDiscovery.CommonId = Discovery.CommonId;

function PutDownDiscovery({
    playerServiceProvider,
    matchService
}) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData, { choice = '' } = {}) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        const opponentId = matchService.getOpponentId(playerId);
        const opponentRequirementService = playerServiceProvider.getRequirementServiceById(opponentId);

        playerStateService.putDownEventCardInZone(cardData);

        if (choice === 'draw') {
            playerRequirementService.addDrawCardRequirement({
                count: 4,
                common: true,
                cardCommonId: cardData.commonId
            });
            opponentRequirementService.addDrawCardRequirement({
                count: 4,
                common: true,
                cardCommonId: cardData.commonId
            });
        }
        else if (choice === 'discard') {
            playerRequirementService.addDiscardCardRequirement({
                count: 2,
                common: true,
                cardCommonId: cardData.commonId
            })
            opponentRequirementService.addDiscardCardRequirement({
                count: 2,
                common: true,
                cardCommonId: cardData.commonId
            })
        }
    }
}

module.exports = PutDownDiscovery;
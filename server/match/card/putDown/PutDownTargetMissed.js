const TargetMissed = require('../../../../shared/card/TargetMissed.js');

PutDownTargetMissed.CommonId = TargetMissed.CommonId;

function PutDownTargetMissed({
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

module.exports = PutDownTargetMissed;

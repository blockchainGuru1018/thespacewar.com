const MissilesLaunched = require('../../../../shared/card/MissilesLaunched.js');

PutDownMissilesLaunched.CommonId = MissilesLaunched.CommonId;

function PutDownMissilesLaunched({
    playerServiceFactory,
    playerServiceProvider
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

module.exports = PutDownMissilesLaunched;

const MissilesLaunched = require('../../../../shared/card/MissilesLaunched.js');

PutDownMissilesLaunched.CommonId = MissilesLaunched.CommonId;

function PutDownMissilesLaunched({
    playerServiceProvider
}) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.putDownEventCardInZone(cardData);

        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        playerRequirementService.addCardRequirementFromSpec(cardData, MissilesLaunched.info.requirementSpecsWhenPutDownInHomeZone);
    }
}

module.exports = PutDownMissilesLaunched;
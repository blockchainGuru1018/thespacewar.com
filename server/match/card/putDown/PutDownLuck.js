const Luck = require('../../../../shared/card/Luck.js');

PutDownLuck.CommonId = Luck.CommonId;

function PutDownLuck({
    playerServiceProvider
}) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData, { choice }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.putDownEventCardInZone(cardData);

        const spec = Luck.Info.choiceToRequirementSpec[choice];
        if (spec) {
            const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
            playerRequirementService.addCardRequirementFromSpec(cardData, spec);
        }
    }
}

module.exports = PutDownLuck;

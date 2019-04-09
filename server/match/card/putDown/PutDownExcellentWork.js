const ExcellentWork = require('../../../../shared/card/ExcellentWork.js');

PutDownExcellentWork.CommonId = ExcellentWork.CommonId;

function PutDownExcellentWork({
    playerServiceProvider,
}) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData, { choice = '' } = {}) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);

        if (choice === 'draw') {
            playerStateService.putDownEventCardInZone(cardData);
            let requirement = ExcellentWork.Info.choiceToRequirement.draw;
            playerRequirementService.addDrawCardRequirement(requirement);
        }
        else {
            throw new Error('Excellent work requires that the player makes a choice, no choice was provided');
        }
    }
}

module.exports = PutDownExcellentWork;
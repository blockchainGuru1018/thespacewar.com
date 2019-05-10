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
            let spec = ExcellentWork.Info.choiceToRequirementSpec.draw;
            playerRequirementService.addCardRequirementFromSpec({ cardData, spec });
        }
        else {
            throw new Error('Excellent work requires that the player makes a choice, no choice or an invalid choice was provided');
        }
    }
}

module.exports = PutDownExcellentWork;

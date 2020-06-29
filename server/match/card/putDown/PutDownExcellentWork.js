const ExcellentWork = require('../../../../shared/card/ExcellentWork.js');

PutDownExcellentWork.CommonId = ExcellentWork.CommonId;

function PutDownExcellentWork({
    playerServiceProvider,
    playerServiceFactory
}) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData, { choice = '' } = {}) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const addRequirementFromSpec = playerServiceFactory.addRequirementFromSpec(playerId);

        if (choice === 'draw') {
            playerStateService.putDownEventCardInZone(cardData);
            addRequirementFromSpec.forCardAndChoiceOfRequirement(cardData, choice);
        }
        else {
            throw new Error('Excellent work requires that the player makes a choice, no choice or an invalid choice was provided');
        }
    }
}

module.exports = PutDownExcellentWork;

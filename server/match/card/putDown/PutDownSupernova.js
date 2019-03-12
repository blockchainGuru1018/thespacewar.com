const Supernova = require('../../../../shared/card/Supernova.js');

const discardCardCount = 3;
PutDownSupernova.CommonId = Supernova.CommonId;

function PutDownSupernova({
    playerServiceProvider,
    matchService
}) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);

        const opponentCardsInZones = [
            ...opponentStateService.getCardsInZone(),
            ...opponentStateService.getCardsInOpponentZone()
        ];
        for (const opponentCard of opponentCardsInZones) {
            opponentStateService.removeCard(opponentCard.id);
            opponentStateService.discardCard(opponentCard);
        }

        const playerCardsInZones = [
            ...playerStateService.getCardsInZone(),
            ...playerStateService.getCardsInOpponentZone()
        ];
        for (const playerCard of playerCardsInZones) {
            playerStateService.removeCard(playerCard.id);
            playerStateService.discardCard(playerCard);
        }

        playerStateService.putDownEventCardInZone(cardData);

        const opponentRequirementService = playerServiceProvider.getRequirementServiceById(opponentId);
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);

        const bothPlayersCanDiscardSomeCard =
            playerRequirementService.canAddDiscardCardRequirementWithCountOrLess(discardCardCount)
            && opponentRequirementService.canAddDiscardCardRequirementWithCountOrLess(discardCardCount);

        addRequirementsToPlayer({ playerId, bothPlayersCanDiscardSomeCard });
        addRequirementsToPlayer({ playerId: opponentId, bothPlayersCanDiscardSomeCard });
    }

    function addRequirementsToPlayer({ playerId, bothPlayersCanDiscardSomeCard }) {
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        playerRequirementService.addDiscardCardRequirement({
            count: discardCardCount,
            common: bothPlayersCanDiscardSomeCard,
            cardCommonId: Supernova.CommonId
        });
        playerRequirementService.addDamageStationCardRequirement({
            count: discardCardCount,
            common: true,
            cardCommonId: Supernova.CommonId
        });
    }
}

module.exports = PutDownSupernova;
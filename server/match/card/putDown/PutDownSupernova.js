const Supernova = require('../../../../shared/card/Supernova.js');

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

        addPlayerRequirementsFromSupernova(playerId);
        addPlayerRequirementsFromSupernova(opponentId);
    }

    function addPlayerRequirementsFromSupernova(playerId) {
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        playerRequirementService.addDiscardCardRequirement({
            count: 3,
            common: true,
            cardCommonId: Supernova.CommonId
        });
        playerRequirementService.addDamageOwnStationCardRequirement({
            count: 3,
            common: true,
            cardCommonId: Supernova.CommonId
        });
    }
}

module.exports = PutDownSupernova;
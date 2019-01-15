const FatalError = require('../../../../shared/card/FatalError.js');

PutDownFatalError.CommonId = FatalError.CommonId;

function PutDownFatalError({
    playerServiceProvider,
    matchService
}) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData, { choice: targetCardId } = {}) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.putDownEventCardInZone(cardData);
        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);

        if (opponentStateService.hasCard(targetCardId)) {
            opponentStateService.removeAndDiscardCardFromStationOrZone(targetCardId);
        }
        else if (playerStateService.hasCard(targetCardId)) {
            playerStateService.removeAndDiscardCardFromStationOrZone(targetCardId);
        }
    }
}

module.exports = PutDownFatalError;
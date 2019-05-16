const TheDarkDestroyer = require('../../../../shared/card/TheDarkDestroyer.js');

PutDownTheDarkDestroyer.CommonId = TheDarkDestroyer.CommonId;

function PutDownTheDarkDestroyer({
    playerServiceProvider,
    matchService
}) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData, { choice: targetCardId } = {}) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.putDownCardInZone(cardData);

        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        if (opponentStateService.hasCard(targetCardId)) {
            opponentStateService.removeAndDiscardCardFromStationOrZone(targetCardId);
        }
    }
}

module.exports = PutDownTheDarkDestroyer;

const FatalError = require('../../../../shared/card/FatalError.js');

PutDownFatalError.CommonId = FatalError.CommonId;

function PutDownFatalError({
    playerServiceProvider,
    matchService,
    playerServiceFactory
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
            const targetCardData = opponentStateService.removeAndDiscardCardFromStationOrZone(targetCardId);

            const opponentActionLog = playerServiceFactory.actionLog(opponentId);
            opponentActionLog.cardsDiscarded({ cardCommonIds: [targetCardData.commonId] });
        }
    }
}

module.exports = PutDownFatalError;

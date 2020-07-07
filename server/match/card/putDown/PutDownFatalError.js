const FatalError = require("../../../../shared/card/FatalError.js");

PutDownFatalError.CommonId = FatalError.CommonId;

function PutDownFatalError({
    playerServiceProvider,
    matchService,
    playerServiceFactory,
}) {
    return {
        canBePlayed,
        forPlayer,
    };

    function canBePlayed(playerId, cardData, { choice: targetCardId } = {}) {
        if (!targetCardId) return false;

        const opponentId = matchService.getOpponentId(playerId);
        const targetCardData = playerServiceFactory
            .playerStateService(opponentId)
            .findCardFromZonesOrStation(targetCardId);
        const target = playerServiceFactory
            .cardFactory()
            .createCardForPlayer(targetCardData, opponentId);
        const fatalError = playerServiceFactory
            .cardFactory()
            .createCardForPlayer(cardData, playerId);
        const actionPoints = playerServiceFactory
            .playerActionPointsCalculator(playerId)
            .calculate();

        return fatalError.actionWhenPutDownInHomeZone.validTarget(
            target,
            actionPoints
        );
    }

    function forPlayer(playerId, cardData, { choice: targetCardId } = {}) {
        const fatalError = playerServiceFactory
            .cardFactory()
            .createCardForPlayer(cardData, playerId);

        fatalError.useAgainst(targetCard(playerId, targetCardId));

        updateActionLog(playerId, targetCardId);
    }

    function targetCard(playerId, targetCardId) {
        const opponentId = matchService.getOpponentId(playerId);
        const targetCardData = playerServiceFactory
            .playerStateService(opponentId)
            .findCardFromZonesOrStation(targetCardId);
        return playerServiceFactory
            .cardFactory()
            .createCardForPlayer(targetCardData, opponentId);
    }

    function updateActionLog(playerId, targetCardId) {
        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(
            opponentId
        );
        if (opponentStateService.hasCard(targetCardId)) {
            const targetCardData = opponentStateService.removeAndDiscardCardFromStationOrZone(
                targetCardId
            );

            const opponentActionLog = playerServiceFactory.actionLog(
                opponentId
            );
            opponentActionLog.cardsDiscarded({
                cardCommonIds: [targetCardData.commonId],
            });
        }
    }
}

module.exports = PutDownFatalError;

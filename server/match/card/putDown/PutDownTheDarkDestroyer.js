const TheDarkDestroyer = require("../../../../shared/card/TheDarkDestroyer.js");
const Avoid = require("../../../../shared/card/Avoid.js");

PutDownTheDarkDestroyer.CommonId = TheDarkDestroyer.CommonId;

function PutDownTheDarkDestroyer({
    playerServiceProvider,
    matchService,
    playerServiceFactory,
}) {
    return {
        forPlayer,
    };

    function forPlayer(playerId, cardData, { choice: targetCardId } = {}) {
        const playerStateService = playerServiceProvider.getStateServiceById(
            playerId
        );
        playerStateService.putDownCardInZone(cardData);

        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(
            opponentId
        );
        const targetCardData = opponentStateService.findCardFromAnySource(
            targetCardId
        );
        if (targetCardData && targetCardData.commonId !== Avoid.CommonId) {
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

module.exports = PutDownTheDarkDestroyer;

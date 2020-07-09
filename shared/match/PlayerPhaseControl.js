const CheatError = require('../../server/match/CheatError.js');

module.exports = function ({
    matchService,
    playerStateService,
    playerNextPhase,
    opponentNextPhase
}) {

    return {
        validateCanGoToNextPhase,
        nextPhase
    };

    function validateCanGoToNextPhase() {
        if (!isCurrentPlayer()) {
            throw new CheatError('Switching phase when not your own turn');
        }

        playerNextPhase.validateCanGoToNextPhase();
    }

    function nextPhase() {
        if (playerNextPhase.canEndTurnForPlayer()) {
            playerNextPhase.endTurnForPlayer();
            opponentNextPhase.next();
        }
        else {
            playerNextPhase.next();
        }
    }

    function isCurrentPlayer() {
        return matchService.getCurrentPlayer() === playerStateService.getPlayerId();
    }
};

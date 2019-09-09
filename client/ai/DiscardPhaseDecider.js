const { PHASES } = require('../../shared/phases.js');

module.exports = function ({
    matchController,
    playerDiscardPhase,
    decideCardToDiscard
}) {
    return {
        decide
    };

    function decide() {
        if (playerDiscardPhase.canLeavePhase()) {
            matchController.emit('nextPhase', { currentPhase: PHASES.discard });
        }
        else {
            const cardToDiscard = decideCardToDiscard();
            matchController.emit('discardCard', { cardId: cardToDiscard });
        }
    }
};

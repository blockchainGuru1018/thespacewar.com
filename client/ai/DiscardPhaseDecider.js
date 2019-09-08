const { PHASES } = require('../../shared/phases.js');

module.exports = function ({
    playerDiscardPhase,
    matchController
}) {
    return {
        decide
    };

    function decide() {
        if (playerDiscardPhase.canLeavePhase()) {
            matchController.emit('nextPhase', { currentPhase: PHASES.discard });
        }
    }
};

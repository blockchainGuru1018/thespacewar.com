const { PHASES } = require('../../shared/phases.js');

module.exports = function ({
    matchController,
    playerRuleService
}) {

    return {
        decide
    };

    function decide() {
        if (playerRuleService.moreCardsCanBeDrawnForDrawPhase()) {
            matchController.emit('drawCard');
        }
        else {
            matchController.emit('nextPhase', { currentPhase: PHASES.draw });
        }
    }
};

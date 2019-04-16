const { COMMON_PHASE_ORDER, PHASES } = require('../phases.js');

module.exports = whatIsNextPhase;

function whatIsNextPhase({ hasDurationCardInPlay, currentPhase }) {
    const nextPhaseInOrder = COMMON_PHASE_ORDER[(COMMON_PHASE_ORDER.indexOf(currentPhase) + 1)];
    if (nextPhaseInOrder === PHASES.preparation) {
        if (!hasDurationCardInPlay) {
            return whatIsNextPhase({ hasDurationCardInPlay, currentPhase: PHASES.preparation });
        }
    }

    return nextPhaseInOrder;
}
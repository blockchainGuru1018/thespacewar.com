const { COMMON_PHASE_ORDER, PHASES } = require("../phases.js");

module.exports = whatIsNextPhase;

function whatIsNextPhase({ hasDurationCardInPlay, currentPhase }) {
    if (currentPhase === PHASES.start) return PHASES.draw;
    if (currentPhase === lastPhase()) return PHASES.wait;

    const nextPhase = nextPhaseInOrder(currentPhase);
    if (nextPhase === PHASES.preparation && !hasDurationCardInPlay) {
        return whatIsNextPhase({
            hasDurationCardInPlay,
            currentPhase: PHASES.preparation,
        });
    }
    return nextPhase;
}

function lastPhase() {
    return COMMON_PHASE_ORDER[COMMON_PHASE_ORDER.length - 1];
}

function nextPhaseInOrder(currentPhase) {
    return COMMON_PHASE_ORDER[COMMON_PHASE_ORDER.indexOf(currentPhase) + 1];
}

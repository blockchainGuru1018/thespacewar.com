const PHASES = {
    preparation: 'preparation',
    draw: 'draw',
    action: 'action',
    discard: 'discard',
    attack: 'attack',
    wait: 'wait'
};

const COMMON_PHASE_ORDER = [PHASES.draw, PHASES.action, PHASES.discard, PHASES.attack];

const TEMPORARY_START_PHASE = 'start';

module.exports = {
    COMMON_PHASE_ORDER,
    PHASES,
    TEMPORARY_START_PHASE
};
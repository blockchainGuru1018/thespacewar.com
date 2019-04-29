const { PHASES } = require('../phases.js');

module.exports = class PlayerPhase {

    constructor({ playerStateService }) {
        this._playerStateService = playerStateService;
    }

    isActionPhase() {
        return this._playerStateService.getPhase() === PHASES.action;
    }

    isWait() {
        return this._playerStateService.getPhase() === PHASES.wait;
    }

    isStart() {
        let phase = this._playerStateService.getPhase();
        return phase === PHASES.start;
    }
};

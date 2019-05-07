const { PHASES } = require('../phases.js');

module.exports = class PlayerPhase {

    constructor({ matchService, playerStateService }) {
        this._matchService = matchService;
        this._playerStateService = playerStateService;
    }

    isFirstDraw() {
        return this._playerStateService.getPhase() === PHASES.draw
            && this._matchService.getTurn() === 1;
    }

    isDraw() {
        return this._playerStateService.getPhase() === PHASES.draw;
    }

    isAction() {
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

const { PHASES } = require('../phases.js');

module.exports = class PlayerPhase {

    constructor({ matchService, playerStateService, opponentStateService }) {
        this._matchService = matchService;
        this._playerStateService = playerStateService;
        this._opponentStateService = opponentStateService;
    }

    selectToStart() {
        const playerId = this._playerStateService.getPlayerId();
        this._matchService.setFirstPlayer(playerId);
        this._matchService.setCurrentPlayer(playerId);
        this.reset();
    }

    reset() {
        this._playerStateService.setPhase(PHASES.start);
        this._opponentStateService.setPhase(PHASES.wait);
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

    isPreparation() {
        return this._playerStateService.getPhase() === PHASES.preparation;
    }
};

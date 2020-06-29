const { COMMON_PHASE_ORDER, PHASES } = require('../phases.js');

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

    get() {
        return this._playerStateService.getPhase();
    }

    set(phase) {
        this._playerStateService.update(playerState => {
            playerState.phase = phase;
        });
    }

    isFirstPhase() {
        return this._playerStateService.getPhase() === COMMON_PHASE_ORDER[0];
    }

    isLastPhase() {
        return this._playerStateService.getPhase() === COMMON_PHASE_ORDER[COMMON_PHASE_ORDER.length - 1];
    }

    isFirstDraw() {
        return this._playerStateService.getPhase() === PHASES.draw
            && this._matchService.getTurn() === 1;
    }

    isDraw() {
        return this._playerStateService.getPhase() === PHASES.draw;
    }

    isDiscard() {
        return this._playerStateService.getPhase() === PHASES.discard;
    }

    isAction() {
        return this._playerStateService.getPhase() === PHASES.action;
    }

    isAttack() {
        return this._playerStateService.getPhase() === PHASES.attack;
    }

    isWait() {
        return this._playerStateService.getPhase() === PHASES.wait;
    }

    isStart() {
        const phase = this._playerStateService.getPhase();
        return phase === PHASES.start;
    }

    isPreparation() {
        return this._playerStateService.getPhase() === PHASES.preparation;
    }
};

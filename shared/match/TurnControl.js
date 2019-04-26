const { PHASES } = require('../phases.js');

module.exports = class TurnControl {

    constructor({ matchService, playerStateService, opponentStateService }) {
        this._matchService = matchService;
        this._playerStateService = playerStateService;
        this._opponentStateService = opponentStateService;
    }

    toggleControlOfTurn() {
        if (this.canTakeControlOfTurn()) {
            this.takeControlOfOpponentsTurn();
        }
        else if (this.canReleaseControlOfTurn()) {
            this.releaseControlOfOpponentsTurn();
        }
    }

    takeControlOfOpponentsTurn() {
        const playerId = this._playerStateService.getPlayerId();
        this._matchService.update(state => {
            state.currentPlayer = playerId;
        });
    }

    releaseControlOfOpponentsTurn() {
        const opponentId = this._opponentStateService.getPlayerId();
        this._matchService.update(state => {
            state.currentPlayer = opponentId;
        });
    }

    canToggleControlOfTurn() {
        return this.canTakeControlOfTurn()
            || this.canReleaseControlOfTurn();
    }

    canTakeControlOfTurn() {
        if (this._playerStateService.getPhase() !== 'wait') return false;

        return this.opponentHasControlOfOwnTurn();
    }

    canReleaseControlOfTurn() {
        return this.playerHasControlOfOpponentsTurn();
    }

    playerHasControlOfOwnTurn() {
        const playerStateService = this._playerStateService;

        return this._matchService.getCurrentPlayer() === playerStateService.getPlayerId()
            && playerStateService.getPhase() !== PHASES.wait;
    }

    opponentHasControlOfOwnTurn() {
        const opponentStateService = this._opponentStateService;

        return this._matchService.getCurrentPlayer() === opponentStateService.getPlayerId()
            && opponentStateService.getPhase() !== PHASES.wait;
    }

    playerHasControlOfOpponentsTurn() {
        const playerStateService = this._playerStateService;

        return this._matchService.getCurrentPlayer() === playerStateService.getPlayerId()
            && playerStateService.getPhase() === PHASES.wait;
    }

    opponentHasControlOfPlayersTurn() {
        const playerStateService = this._playerStateService;

        return this._matchService.getCurrentPlayer() !== playerStateService.getPlayerId()
            && playerStateService.getPhase() !== PHASES.wait;
    }
};

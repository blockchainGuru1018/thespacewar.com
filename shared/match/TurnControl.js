const TakeControlEvent = require("../event/TurnControlEvent.js");

module.exports = class TurnControl {

    constructor({
        matchService,
        playerStateService,
        opponentStateService,
        opponentPhase,
        playerPhase
    }) {
        this._matchService = matchService;

        this._playerStateService = playerStateService;
        this._playerPhase = playerPhase;

        this._opponentStateService = opponentStateService;
        this._opponentPhase = opponentPhase;
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
        this._playerStateService.storeEvent(TakeControlEvent.takeControlOfOpponentsTurn());

        const playerId = this._playerStateService.getPlayerId();
        this._matchService.update(state => {
            state.currentPlayer = playerId;
        });
    }

    releaseControlOfOpponentsTurn() {
        this._playerStateService.storeEvent(TakeControlEvent.releaseControlOfOpponentsTurn());

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
        return !this._opponentPhase.isStart()
            && !this._opponentPhase.isFirstDraw()
            && this._playerPhase.isWait()
            && this.opponentHasControlOfOwnTurn();
    }

    canReleaseControlOfTurn() {
        return this.playerHasControlOfOpponentsTurn();
    }

    playerHasControl() {
        return this.playerHasControlOfOpponentsTurn()
            || this.playerHasControlOfOwnTurn();
    }

    playerHasControlOfOwnTurn() {
        const playerStateService = this._playerStateService;

        return this._matchService.getCurrentPlayer() === playerStateService.getPlayerId()
            && !this._playerPhase.isWait();
    }

    opponentHasControlOfOwnTurn() {
        const opponentStateService = this._opponentStateService;

        return this._matchService.getCurrentPlayer() === opponentStateService.getPlayerId()
            && !this._opponentPhase.isWait();
    }

    playerHasControlOfOpponentsTurn() {
        const playerStateService = this._playerStateService;

        return this._matchService.getCurrentPlayer() === playerStateService.getPlayerId()
            && this._playerPhase.isWait();
    }

    opponentHasControlOfPlayersTurn() {
        const playerStateService = this._playerStateService;

        return this._matchService.getCurrentPlayer() !== playerStateService.getPlayerId()
            && !this._playerPhase.isWait();
    }
};

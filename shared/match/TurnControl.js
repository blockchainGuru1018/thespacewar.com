const TakeControlEvent = require("../event/TurnControlEvent.js");

module.exports = class TurnControl {

    constructor({
        matchService,
        playerStateService,
        playerPhase,
        playerGameTimer,
        opponentStateService,
        opponentPhase,
        opponentActionLog,
        opponentGameTimer,
        lastStand
    }) {
        this._matchService = matchService;
        this._lastStand = lastStand;

        this._playerStateService = playerStateService;
        this._playerPhase = playerPhase;
        this._playerGameTimer = playerGameTimer;

        this._opponentStateService = opponentStateService;
        this._opponentPhase = opponentPhase;
        this._opponentActionLog = opponentActionLog;
        this._opponentGameTimer = opponentGameTimer;
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

        const playerId = this._playerId();
        this._matchService.update(state => {
            state.currentPlayer = playerId;
        });

        this._opponentActionLog.opponentTookControlOfTurn();
    }

    releaseControlOfOpponentsTurn() {
        this._playerStateService.storeEvent(TakeControlEvent.releaseControlOfOpponentsTurn());

        const opponentId = this._opponentId();
        this._matchService.update(state => {
            state.currentPlayer = opponentId;
        });
        if (this._playerGameTimer.hasEnded()) {
            this._matchService.playerRetreat(this._playerId());
        }

        this._opponentActionLog.opponentReleasedControlOfTurn();
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
        return this.playerHasControlOfOpponentsTurn()
            && !this._lastStand.hasStarted();
    }

    playerHasControl() {
        return this.playerHasControlOfOpponentsTurn()
            || this.playerHasControlOfOwnTurn();
    }

    playerHasControlOfOwnTurn() {
        return this._matchService.getCurrentPlayer() === this._playerId()
            && !this._playerPhase.isWait();
    }

    opponentHasControlOfOwnTurn() {
        return this._matchService.getCurrentPlayer() === this._opponentId()
            && !this._opponentPhase.isWait();
    }

    playerHasControlOfOpponentsTurn() {
        return this._matchService.getCurrentPlayer() === this._playerId()
            && this._playerPhase.isWait();
    }

    opponentHasControlOfPlayersTurn() {
        return this._matchService.getCurrentPlayer() !== this._playerId()
            && !this._playerPhase.isWait();
    }

    _playerId() {
        return this._playerStateService.getPlayerId();
    }

    _opponentId() {
        return this._opponentStateService.getPlayerId();
    }
};

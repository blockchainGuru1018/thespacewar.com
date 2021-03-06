const TakeControlEvent = require("../event/TurnControlEvent.js");
const TargetMissed = require("../card/TargetMissed");
const Avoid = require("../card/Avoid");

module.exports = class TurnControl {
  constructor({
    matchService,
    playerStateService,
    playerPhase,
    playerGameTimer,
    opponentStateService,
    opponentPhase,
    opponentActionLog,
    lastStand,
  }) {
    this._matchService = matchService;
    this._lastStand = lastStand;

    this._playerStateService = playerStateService;
    this._playerPhase = playerPhase;
    this._playerGameTimer = playerGameTimer;

    this._opponentStateService = opponentStateService;
    this._opponentPhase = opponentPhase;
    this._opponentActionLog = opponentActionLog;
  }

  toggleControlOfTurn() {
    if (this.canTakeControlOfTurn()) {
      this.takeControlOfOpponentsTurn();
    } else if (this.canReleaseControlOfTurn()) {
      this.releaseControlOfOpponentsTurn();
    }
  }

  takeControlOfOpponentsTurn() {
    this._playerStateService.storeEvent(
      TakeControlEvent.takeControlOfOpponentsTurn()
    );

    const playerId = this._playerId();
    this._matchService.setCurrentPlayer(playerId);

    this._opponentActionLog.opponentTookControlOfTurn();
  }

  releaseControlOfOpponentsTurn() {
    this._playerStateService.storeEvent(
      TakeControlEvent.releaseControlOfOpponentsTurn()
    );

    const opponentId = this._opponentId();
    this._matchService.setCurrentPlayer(opponentId);
    if (this._playerGameTimer.hasEnded()) {
      this._matchService.playerRetreat(this._playerId());
    }

    this._opponentActionLog.opponentReleasedControlOfTurn();
  }

  canToggleControlOfTurn() {
    return this.canTakeControlOfTurn() || this.canReleaseControlOfTurn();
  }

  hasTargetMissed() {
    const hasTargetMissed =
      this._getZeroCostCards().filter(
        (card) => card.commonId === TargetMissed.CommonId
      ).length > 0;
    return hasTargetMissed;
  }

  _getZeroCostCards() {
    return [
      ...this._playerStateService.getCardsOnHand(),
      ...this._playerStateService.getFlippedStationCards().map((c) => c.card),
    ]
      .map((cardData) =>
        this._playerStateService.createBehaviourCardById(cardData.id)
      )
      .filter((card) => !card.baseCostIsDinamyc && card.costToPlay === 0);
  }

  _hasAvoidInPlay() {
    return [...this._playerStateService.getCardsInZone()].some(
      (c) => c.commonId === Avoid.CommonId
    );
  }

  hasZeroCostCardsToPlay() {
    return this._getZeroCostCards().length > 0 || this._hasAvoidInPlay();
  }

  canTakeControlOfTurn() {
    return (
      !this._opponentPhase.isStart() &&
      !this._opponentPhase.isFirstDraw() &&
      this._playerPhase.isWait() &&
      this.opponentHasControlOfOwnTurn() &&
      !this._opponentHasCardThatPreventsPlayerPlayingEventCards() &&
      !this._playerHasCardThatPreventsPlayerPlayingEventCards()
    );
  }

  canReleaseControlOfTurn() {
    return (
      this.playerHasControlOfOpponentsTurn() && !this._lastStand.hasStarted()
    );
  }

  playerHasControl() {
    return (
      this.playerHasControlOfOpponentsTurn() || this.playerHasControlOfOwnTurn()
    );
  }

  opponentHasControl() {
    return (
      this.opponentHasControlOfPlayersTurn() ||
      this.opponentHasControlOfOwnTurn()
    );
  }

  playerHasControlOfOwnTurn() {
    return (
      this._matchService.getCurrentPlayer() === this._playerId() &&
      !this._playerPhase.isWait()
    );
  }

  opponentHasControlOfOwnTurn() {
    return (
      this._matchService.getCurrentPlayer() === this._opponentId() &&
      !this._opponentPhase.isWait()
    );
  }

  playerHasControlOfOpponentsTurn() {
    return (
      this._matchService.getCurrentPlayer() === this._playerId() &&
      this._playerPhase.isWait()
    );
  }

  opponentHasControlOfPlayersTurn() {
    return (
      this._matchService.getCurrentPlayer() !== this._playerId() &&
      !this._playerPhase.isWait()
    );
  }

  _opponentHasCardThatPreventsPlayerPlayingEventCards() {
    const cards = this._opponentStateService.getMatchingBehaviourCards(
      (card) => card.preventsOpponentFromPlayingAnEventCard
    );
    return cards.length > 0;
  }

  _playerHasCardThatPreventsPlayerPlayingEventCards() {
    const cards = this._playerStateService.getMatchingBehaviourCards(
      (card) => card.preventsOpponentFromPlayingAnEventCard
    );
    return cards.length > 0;
  }

  _playerId() {
    return this._playerStateService.getPlayerId();
  }

  _opponentId() {
    return this._opponentStateService.getPlayerId();
  }

  _playerState() {
    return this._matchService.getState().playerStateById[this._playerId()];
  }
};

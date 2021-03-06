const { inspect } = require("util");

const LOG_ALL_EMITS = false;

const preparePlayerState = require("./preparePlayerState.js");
const prepareOpponentState = require("./prepareOpponentState.js");

class MatchComService {
  constructor({
    players,
    logger,
    matchService,
    playerServiceProvider,
    playerServiceFactory,
    gameServiceFactory,
    stateChangeListener,
    registerLogGame,
  }) {
    this._players = players;
    this._logger = logger;
    this._matchService = matchService;
    this._playerServiceProvider = playerServiceProvider;
    this._playerServiceFactory = playerServiceFactory;
    this._gameServiceFactory = gameServiceFactory;
    this._emittedAllState = false;
    this._registerLogGame = registerLogGame;

    stateChangeListener.listenForSnapshots(this._onSnapshot.bind(this));
  }

  callStarted() {
    this._emittedAllState = false;
  }

  callEnded() {
    this._emittedAllState = false;
  }

  getPlayers() {
    return [...this._players];
  }

  getPlayerIds() {
    return this._players.map((p) => p.id);
  }

  getPlayerConnection(playerId) {
    return this._getPlayer(playerId).connection;
  }

  updatePlayer(playerId, mergeData) {
    const player = this._players.find((p) => p.id === playerId);
    Object.assign(player, mergeData);
  }

  getOpponentId(playerId) {
    return this.getPlayerIds().find((id) => id !== playerId);
  }

  emitToOpponentOf(playerId, action, value) {
    const opponentId = this.getOpponentId(playerId);
    this.emitToPlayer(opponentId, action, value);
  }

  emitToPlayer(playerId, action, value) {
    const playerConnection = this.getPlayerConnection(playerId);
    if (LOG_ALL_EMITS) {
      this._logger.log(
        "DEBUG_LOG_NOT_AN_ERROR!",
        `[${new Date().toISOString()}] emitToPlayer(${playerId}, ${action}, ${JSON.stringify(
          value,
          null,
          4
        )}) stack: ${new Error().stack}`,
        "match"
      );
    }
    try {
      playerConnection.emit("match", {
        matchId: this._matchService.matchId(),
        playerId: playerId,
        action,
        value,
      });
    } catch (error) {
      this._logger.log(
        `Disconnected user - Tried to emit to user that has disconnected (matchId:${this._matchService.matchId()}, userId:${playerId})`,
        "match"
      );
      this._logger.log(
        `RAW ERROR while trying to connect to player: ${error.message}`,
        "match"
      );
    }
  }

  prepareStationCardsForClient(stationCards) {
    return stationCards.map(this.prepareStationCardForClient);
  }

  prepareStationCardForClient(stationCard) {
    const model = {
      id: stationCard.card.id,
      place: stationCard.place,
    };
    if (stationCard.flipped) {
      model.flipped = true;
      model.card = stationCard.card;
    }
    return model;
  }

  emitCurrentStateToPlayers() {
    this._emittedAllState = true;

    this._gameEndedCheck();
    this._computeGameTimerState();

    for (const player of this.getPlayers()) {
      const playerId = player.id;
      const playerState = this._getPlayerState(playerId);

      const opponentId = this.getOpponentId(playerId);
      const opponentState = this._getPlayerState(opponentId);
      const botCardsOnHand =
        opponentId === "BOT" || playerId === "BOT"
          ? opponentState.cardsOnHand
          : [];

      const data = {
        mode: this._matchService.mode(),
        playerOrder: this._matchService.getPlayerOrder(),
        readyPlayerIds: this._matchService.getReadyPlayerIds(),
        currentPlayer: this._matchService.getCurrentPlayer(),
        turn: this._matchService.getTurn(),
        gameConfigEntity: this._matchService.getGameConfigEntity(),
        botCardsOnHand,
        ...preparePlayerState(playerState),
        ...this._prepareOpponentState(opponentState),

        ...this._getGameEndedState(),
      };

      if (Object.keys(data).length > 0) {
        this.emitToPlayer(playerId, "stateChanged", data);
      }
    }
  }

  _getPlayer(playerId) {
    return this._players.find((p) => p.id === playerId);
  }

  _onSnapshot(snapshot) {
    if (this._emittedAllState) return;

    this._gameEndedCheck();
    this._computeGameTimerState(snapshot);

    for (const player of this.getPlayers()) {
      const playerId = player.id;
      const opponentId = this.getOpponentId(playerId);

      const data = {
        ...this._getGameEndedState(),

        ...preparePlayerState(this._getPlayerChangedState(playerId, snapshot)),
        ...this._prepareOpponentState(
          this._getPlayerChangedState(opponentId, snapshot)
        ),
      };

      const allChangedDataKeys = Object.keys(data);
      if (allChangedDataKeys.length > 0) {
        this.emitToPlayer(playerId, "stateChanged", data);
      }
    }
  }

  _gameEndedCheck() {
    if (this._gameIsOver()) {
      this._endGame();
    }
  }

  _endGame() {
    const [firstPlayerId, secondPlayerId] = this._matchService.getPlayerOrder();
    const lastStand = this._gameServiceFactory.lastStand();

    if (this._somePlayerHasLost()) {
      const losingPlayerId = this._playerHasLost(firstPlayerId)
        ? firstPlayerId
        : secondPlayerId;
      this._matchService.playerRetreat(losingPlayerId);
    } else if (lastStand.canStart()) {
      const secondPlayerLastStand = this._playerServiceFactory.playerLastStand(
        secondPlayerId
      );
      const firstPlayerLastStand = this._playerServiceFactory.playerLastStand(
        firstPlayerId
      );
      if (secondPlayerLastStand.canStart()) {
        secondPlayerLastStand.start();
      } else if (firstPlayerLastStand.canStart()) {
        firstPlayerLastStand.start();
      }
    }
  }

  _somePlayerHasLost() {
    const [firstPlayerId, secondPlayerId] = this._matchService.getPlayerOrder();
    return (
      this._playerHasLost(firstPlayerId) || this._playerHasLost(secondPlayerId)
    );
  }

  _gameIsOver() {
    const theGameHasStarted = this._matchService.isGameOn();
    return theGameHasStarted && this._somePlayerHasWon();
  }

  _somePlayerHasWon() {
    const [firstPlayerId, secondPlayerId] = this._matchService.getPlayerOrder();

    const firstPlayerStateService = this._playerServiceProvider.getStateServiceById(
      firstPlayerId
    );
    const allFirstPlayerStationCardsAreDamaged =
      firstPlayerStateService.getUnflippedStationCardsCount() === 0;

    const secondPlayerStateService = this._playerServiceProvider.getStateServiceById(
      secondPlayerId
    );
    const allSecondPlayerStationCardsAreDamaged =
      secondPlayerStateService.getUnflippedStationCardsCount() === 0;

    return (
      allFirstPlayerStationCardsAreDamaged ||
      allSecondPlayerStationCardsAreDamaged
    );
  }

  _logError(error) {
    const rawErrorMessage = JSON.stringify(inspect(error), null, 4);
    const errorMessage = `(${new Date().toISOString()}) Error in action to match: ${
      error.message
    } - RAW ERROR: ${rawErrorMessage}`;
    this._logger.log(errorMessage, "error");
  }

  _playerHasLost(playerId) {
    const playerStateService = this._playerServiceProvider.getStateServiceById(
      playerId
    );
    const allStationCardsAreDamaged =
      playerStateService.getUnflippedStationCardsCount() === 0;
    const lastStand = this._gameServiceFactory.lastStand(playerId);
    const cannotCounterOrHasAlreadyCountered =
      !this._playerCanAvoidStationCardAttack(playerId) || lastStand.hasEnded(); // WARNING 2020-06-22: _playerCanAvoidStationCardAttack is duplicated in PlayerLastStand.js.
    return allStationCardsAreDamaged && cannotCounterOrHasAlreadyCountered;
  }

  _playerCanAvoidStationCardAttack(playerId) {
    const playerStateService = this._playerServiceProvider.getStateServiceById(
      playerId
    );
    const queryPlayerRequirements = this._playerServiceFactory.queryPlayerRequirements(
      playerId
    );
    const cardsCanBeUsedToCounter = playerStateService.getMatchingPlayableBehaviourCards(
      (card) => {
        return card.canCounterCardsBeingPlayed || card.canCounterAttacks;
      }
    );
    const isCurrentlyUsingCounter =
      queryPlayerRequirements.getFirstMatchingRequirement({
        type: "counterCard",
      }) ||
      queryPlayerRequirements.getFirstMatchingRequirement({
        type: "counterAttack",
      });
    return cardsCanBeUsedToCounter.length > 0 || isCurrentlyUsingCounter;
  }

  _computeGameTimerState(snapshot = null) {
    if (this._matchService.isGameOn()) {
      this._computeGameTimerStateForWhenGameIsOn();

      if (snapshot) {
        this._setSnapshotDirtyForClockKey(snapshot);
      }
    } else if (!this._matchService.allPlayersReady()) {
      this._computeGameTimerStateForBeforeAllPlayersAreReady();

      if (snapshot) {
        this._setSnapshotDirtyForClockKey(snapshot);
      }
    }
  }

  _computeGameTimerStateForBeforeAllPlayersAreReady() {
    const playerReadyId = this._matchService.getReadyPlayerIds()[0];
    if (!playerReadyId) return;

    const playerNotReadyGameTimer = this._playerServiceFactory.playerGameTimer(
      this._matchService.getOpponentId(playerReadyId)
    );
    playerNotReadyGameTimer.switchTo();
  }

  _computeGameTimerStateForWhenGameIsOn() {
    const [firstPlayerId, secondPlayerId] = this._matchService.getPlayerOrder();
    const queryFirstPlayerRequirements = this._playerServiceFactory.queryPlayerRequirements(
      firstPlayerId
    );
    if (
      queryFirstPlayerRequirements.isWaitingOnOpponentFinishingRequirement()
    ) {
      const secondPlayerGameTimer = this._playerServiceFactory.playerGameTimer(
        secondPlayerId
      );
      secondPlayerGameTimer.switchTo();

      return;
    }

    const querySecondPlayerRequirements = this._playerServiceFactory.queryPlayerRequirements(
      secondPlayerId
    );
    if (
      querySecondPlayerRequirements.isWaitingOnOpponentFinishingRequirement()
    ) {
      const firstPlayerGameTimer = this._playerServiceFactory.playerGameTimer(
        firstPlayerId
      );
      firstPlayerGameTimer.switchTo();

      return;
    }

    const firstPlayerTurnControl = this._playerServiceFactory.turnControl(
      firstPlayerId
    );
    if (firstPlayerTurnControl.playerHasControl()) {
      const firstPlayerGameTimer = this._playerServiceFactory.playerGameTimer(
        firstPlayerId
      );
      firstPlayerGameTimer.switchTo();
    } else {
      const secondPlayerGameTimer = this._playerServiceFactory.playerGameTimer(
        secondPlayerId
      );
      secondPlayerGameTimer.switchTo();
    }
  }

  _setSnapshotDirtyForClockKey(snapshot) {
    for (const playerId of this._matchService.getPlayerIds()) {
      snapshot.changedKeysByPlayerId[playerId].push("clock");
    }
  }

  _getGameEndedState() {
    return {
      ended: this._matchService.hasGameEnded(),
      currentPlayer: this._matchService.getCurrentPlayer(),
      retreatedPlayerId: this._matchService.getRetreatedPlayerId(),
      lastStandInfo: this._matchService.getState().lastStandInfo,
    };
  }

  _prepareOpponentState(state) {
    return prepareOpponentState(state, this._getContext());
  }

  _getContext() {
    return {
      matchMode: this._matchService.mode(),
    };
  }

  _getPlayerState(playerId) {
    const playerStateService = this._playerServiceProvider.getStateServiceById(
      playerId
    );
    return playerStateService.getPlayerState();
  }

  _getPlayerChangedState(playerId, snapshot) {
    const playerChangedKeys = snapshot.changedKeysByPlayerId[playerId];
    const playerStateService = this._playerServiceProvider.getStateServiceById(
      playerId
    );
    const playerState = playerStateService.getPlayerState();
    return getChangedStateFromChangedKeys(playerState, playerChangedKeys);
  }
}

function getChangedStateFromChangedKeys(state, changedKeys) {
  const changedState = {};
  for (const key of changedKeys) {
    changedState[key] = state[key];
  }

  return changedState;
}

module.exports = MatchComService;

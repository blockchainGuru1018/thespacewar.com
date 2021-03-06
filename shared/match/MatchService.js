const MatchMode = require("./MatchMode.js");

class MatchService {
  constructor({
    gameConfig,
    endMatch = () => {},
    registerLogGame = () => Promise.resolve(),
    logger = {
      log: (...args) => console.log("PlayerStateService logger: ", ...args),
    },
  } = {}) {
    this._state = {};
    this._gameConfig = gameConfig;
    this._registerLogGame = registerLogGame;
    this._logger = logger;
    this.endMatch = endMatch;
  }

  matchId() {
    return this._state.matchId;
  }

  setState(state) {
    this._state = state;
  }

  getState() {
    return this._state;
  }

  getTurn() {
    return this._state.turn;
  }

  getCurrentPlayer() {
    return this._state.currentPlayer;
  }

  setCurrentPlayer(playerId) {
    this.update((state) => {
      state.currentPlayer = playerId;
    });

    return playerId;
  }

  getPlayerOrder() {
    return this._state.playerOrder;
  }

  getReadyPlayerIds() {
    return this._state.readyPlayerIds;
  }

  getFirstPlayerId() {
    return this._state.playerOrder[0];
  }

  getLastPlayerId() {
    const playerOrder = this.getPlayerOrder();
    return playerOrder[playerOrder.length - 1];
  }

  getRetreatedPlayerId() {
    return this._state.retreatedPlayerId;
  }

  playerRetreat(playerId) {
    if (this.somePlayerHasAlreadyRetreated() || this.hasGameEnded()) return;

    if (this._gameHasStartedFully()) {
      this._logLostGame(playerId);
    }

    this.update((state) => {
      state.ended = true;
      state.retreatedPlayerId = playerId;
    });

    this.endMatch();
  }

  _logLostGame(losingPlayerId) {
    const winningPlayerId = this.getOpponentId(losingPlayerId);
    this._registerLogGame(
      winningPlayerId,
      losingPlayerId,
      this.gameLengthSeconds()
    ).catch((error) => {
      this._logError(error);
    });
  }

  _gameHasStartedFully() {
    return this.isGameOn();
  }

  gameIsHumanVsHuman() {
    const [firstPlayerId, secondPlayerId] = this.getPlayerOrder();
    return secondPlayerId !== "BOT" && firstPlayerId !== "BOT";
  }

  somePlayerHasAlreadyRetreated() {
    return !!this.getState().retreatedPlayerId;
  }

  hasGameEnded() {
    return this._state.ended;
  }

  getOpponentId(playerId) {
    const firstPlayerId = this.getFirstPlayerId();
    return firstPlayerId === playerId ? this.getLastPlayerId() : firstPlayerId;
  }

  isPlayerCardInHomeZone(playerId, cardId) {
    return this._state.playerStateById[playerId].cardsInZone.some(
      (c) => c.id === cardId
    );
  }

  cardsAreInSameZone(card, otherCard) {
    const otherCardIsInItsHomeZone = this.isPlayerCardInHomeZone(
      otherCard.playerId,
      otherCard.id
    );
    const cardIsInHomeZone = this.isPlayerCardInHomeZone(
      card.playerId,
      card.id
    );
    return otherCardIsInItsHomeZone !== cardIsInHomeZone;
  }

  goToNextTurn() {
    this.update((state) => {
      state.turn += 1;
      state.currentPlayer = this.getFirstPlayerId();
    });
  }

  goToNextPlayer() {
    const playerOrder = this.getPlayerOrder();
    const currentPlayerId = this.getCurrentPlayer();
    const currentPlayerIndex = playerOrder.indexOf(currentPlayerId);
    if (currentPlayerIndex === playerOrder.length - 1) {
      throw new Error(
        "Cannot go to next player. There are no more players for this turn."
      );
    }

    this.update((state) => {
      state.currentPlayer = playerOrder[currentPlayerIndex + 1];
    });
  }

  update(updateFn) {
    return updateFn(this._state);
  }

  getPlayerState(playerId) {
    return this._state.playerStateById[playerId];
  }

  storeEvent(playerId, event) {
    this.getPlayerState(playerId).events.push(event);
  }

  getGameStartTime() {
    return this._state.gameStartTime;
  }

  getGameConfigEntity() {
    return this._gameConfig.entity();
  }

  mode() {
    return this._state.mode;
  }

  isGameOn() {
    return this._state.mode === MatchMode.game && !this._state.ended;
  }

  startSelectingStationCards() {
    this._state.mode = MatchMode.selectStationCards;
  }

  startGame() {
    this._state.mode = MatchMode.game;
  }

  setFirstPlayer(playerId) {
    this._state.playerOrder = [playerId, this.getOpponentId(playerId)];
  }

  allPlayersConnected() {
    return this._state.playersConnected >= this._state.playerOrder.length;
  }

  allPlayersReady() {
    return this._state.playerOrder.every((id) =>
      this._state.readyPlayerIds.includes(id)
    );
  }

  connectPlayer(playerId, deckId, customDeck) {
    this._state.playersConnected++;
    this._state.playerStateById[playerId] = {};
    this._state.deckIdByPlayerId[playerId] = deckId;
    this._state.customDeckByPlayerId[playerId] = customDeck;
  }
  getPlayerIds() {
    return [...this._state.playerOrder];
  }

  gameLengthSeconds() {
    let currentTime = Date.now();

    return (currentTime - this._state.gameStartTime) / 1000;
  }

  _logError(error) {
    const rawErrorMessage = JSON.stringify(error, null, 4);
    const errorMessage = `(${new Date().toISOString()}) Error in action to match: ${
      error.message
    } - RAW ERROR: ${rawErrorMessage}`;
    this._logger.log(errorMessage, "error");
  }
}

module.exports = MatchService;

const MatchMode = require('./MatchMode.js');
const EndMatchDelay = 15 * 1000;

class MatchService {

    constructor({
                    gameConfig,
                    endMatch = () => {
                    }
                } = {}) {
        this._state = {};
        this._gameConfig = gameConfig;
        this.endMatch = endMatch;
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
        this.update(state => {
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

        this.update(state => {
            state.ended = true;
            state.retreatedPlayerId = playerId;
        });

        const endMatch = this.endMatch;
        setTimeout(() => {
            endMatch()
        }, EndMatchDelay);
    }

    gameIsHumanVsHuman() {
        const [firstPlayerId, secondPlayerId] = this.getPlayerOrder();
        return secondPlayerId !== 'BOT' && firstPlayerId !== 'BOT';
    }

    /**
     * @description Check if player human start game with BOT
     * @returns {boolean|boolean}
     */
    gameIsHumanVsBot() {
        const [firstPlayerId, secondPlayerId] = this.getPlayerOrder();
        return firstPlayerId === 'BOT' || secondPlayerId === 'BOT';
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
        return this._state.playerStateById[playerId].cardsInZone.some(c => c.id === cardId);
    }

    cardsAreInSameZone(card, otherCard) {
        const otherCardIsInItsHomeZone = this.isPlayerCardInHomeZone(otherCard.playerId, otherCard.id);
        const cardIsInHomeZone = this.isPlayerCardInHomeZone(card.playerId, card.id);
        return otherCardIsInItsHomeZone !== cardIsInHomeZone;
    }

    goToNextTurn() {
        this.update(state => {
            state.turn += 1;
            state.currentPlayer = this.getFirstPlayerId();
        });
    }

    goToNextPlayer() {
        const playerOrder = this.getPlayerOrder();
        const currentPlayerId = this.getCurrentPlayer();
        const currentPlayerIndex = playerOrder.indexOf(currentPlayerId);
        if (currentPlayerIndex === playerOrder.length - 1) {
            throw new Error('Cannot go to next player. There are no more players for this turn.');
        }

        this.update(state => {
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
        return this._state.mode === MatchMode.game
            && !this._state.ended;
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
        return this._state.playerOrder.every(id => this._state.readyPlayerIds.includes(id));
    }

    connectPlayer(playerId) {
        this._state.playersConnected++;
        this._state.playerStateById[playerId] = {};
    }

    getPlayerIds() {
        return [...this._state.playerOrder];
    }

    gameLengthSeconds() {
        let currentTime = Date.now();

        return (currentTime - this._state.gameStartTime) / 1000;
    }
}

module.exports = MatchService;

class MatchService {

    constructor({
        gameConfig,
        endMatch = () => {}
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
        return this._state.currentPlayer = playerId;
    }

    getPlayerOrder() {
        return this._state.playerOrder;
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

    updatePlayerCard(playerId, cardId, updateFn) {
        const playerState = this.getPlayerState(playerId);
        let card = playerState.cardsInZone.find(c => c.id === cardId)
            || playerState.cardsInOpponentZone.find(c => c.id === cardId);
        if (!card) throw Error('Could not find card when trying to update it. ID: ' + cardId);

        updateFn(card);
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

    startGame() {
        this._state.mode = 'game';
    }

    setFirstPlayer(playerId) {
        this._state.playerOrder = [playerId, this.getOpponentId(playerId)];
    }

    allPlayersReady() {
        return this._state.playersReady >= this._state.playerOrder.length;
    }

    readyPlayer(playerId) {
        this._state.playersReady++;
        this._state.playerStateById[playerId] = {};
    }

    getPlayerIds() {
        return [...this._state.playerOrder];
    }
}

module.exports = MatchService;

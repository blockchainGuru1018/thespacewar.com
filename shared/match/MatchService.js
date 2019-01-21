class MatchService {

    constructor({
        endMatch = () => {}
    } = {}) {
        this._state = {};
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

    getOpponentId(playerId) {
        const firstPlayerId = this.getFirstPlayerId();
        return firstPlayerId === playerId ? this.getLastPlayerId() : firstPlayerId;
    }

    getZoneWhereCardIs(cardId) {
        for (let playerId of Object.keys(this._state.playerStateById)) {
            const playerState = this._state.playerStateById[playerId];
            for (let card of playerState.cardsInZone) {
                if (card.id === cardId) return playerState.cardsInZone;
            }
            for (let card of playerState.cardsInOpponentZone) {
                if (card.id === cardId) return playerState.cardsInOpponentZone;
            }
        }
        return null;
    }

    isPlayerCardInHomeZone(playerId, cardId) {
        return this._state.playerStateById[playerId].cardsInZone.some(c => c.id === cardId);
    }

    goToNextTurn() {
        this.update(state => {
            state.turn += 1;
            state.currentPlayer = this.getFirstPlayerId();
        });
    }

    goToNextPlayer() {
        const playerOrder = this.getPlayerOrder();
        const currentPlayerId = this.getCurrentPlayer()
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
}

module.exports = MatchService;
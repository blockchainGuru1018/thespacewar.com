class MatchService {

    constructor({
        endMatch = () => {
        } //TODO Fix so that WebStorm does not put curly braces on new line
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

    updatePlayerState(playerId, updateFn) {
        const playerState = this.getPlayerState(playerId);
        updateFn(playerState);
        return playerState;
    }

    getPlayerState(playerId) {
        return this._state.playerStateById[playerId];
    }

    getPlayerDeck(playerId) {
        return this._state.deckByPlayerId[playerId];
    }

    getStationDrawCardsCount(playerId) {
        let stationCards = this.getPlayerStationCards(playerId);
        return stationCards
            .filter(card => card.place === 'draw')
            .length;
    }

    getPlayerStationCards(playerId) {
        const playerState = this.getPlayerState(playerId);
        return playerState.stationCards;
    }

    storeEvent(playerId, event) {
        this.getPlayerState(playerId).events.push(event);
    }
}

module.exports = MatchService;
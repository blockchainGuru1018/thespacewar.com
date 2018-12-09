class MatchService {

    constructor(deps) {
        this._state = {};
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
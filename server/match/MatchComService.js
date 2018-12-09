class MatchComService {

    constructor({ matchId, playerIds, connectionsByPlayerId }) {
        this._matchId = matchId;
        this._playerIds = playerIds;
        this._connectionsByPlayerId = connectionsByPlayerId;
    }

    emitToOpponentOf(playerId, action, value) {
        const opponentId = this.getOpponentId(playerId);
        this.emitToPlayer(opponentId, action, value);
    }

    getOpponentId(playerId) {
        return this._playerIds.find(id => id !== playerId);
    }

    emitToPlayer(playerId, action, value) {
        const playerConnection = this._connectionsByPlayerId[playerId]
        playerConnection.emit('match', {
            matchId: this._matchId,
            action,
            value
        });
    }

    prepareStationCardsForClient(stationCards) {
        return stationCards.map(this.prepareStationCardForClient);
    }

    prepareStationCardForClient(stationCard) {
        let model = {
            id: stationCard.card.id,
            place: stationCard.place
        };
        if (stationCard.flipped) {
            model.flipped = true;
            model.card = stationCard.card;
        }
        return model;
    }

}

module.exports = MatchComService;

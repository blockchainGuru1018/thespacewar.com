const preparePlayerState = require('./preparePlayerState.js');
const prepareOpponentState = require('./prepareOpponentState.js');

class MatchComService {

    constructor({ matchId, players, stateChangeListener }) {
        this._matchId = matchId;
        this._players = players;

        stateChangeListener.listenForSnapshots(this._onSnapshot.bind(this));
    }

    getPlayers() {
        return [...this._players];
    }

    getPlayerIds() {
        return this._players.map(p => p.id);
    }

    getPlayerConnection(playerId) {
        return this._getPlayer(playerId).connection;
    }

    updatePlayer(playerId, mergeData) {
        const player = this._players.find(p => p.id === playerId);
        Object.assign(player, mergeData);
    }

    getOpponentId(playerId) {
        return this
            .getPlayerIds()
            .find(id => id !== playerId);
    }

    emitToOpponentOf(playerId, action, value) {
        const opponentId = this.getOpponentId(playerId);
        this.emitToPlayer(opponentId, action, value);
    }

    emitToPlayer(playerId, action, value) {
        const playerConnection = this.getPlayerConnection(playerId);
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

    _getPlayer(playerId) {
        return this._players.find(p => p.id === playerId);
    }

    _onSnapshot(snapshot) {
        for (const player of this.getPlayers()) {
            const playerId = player.id;
            let opponentId = this.getOpponentId(playerId);
            const playerChangedState = snapshot.changeDataByPlayerId[playerId];
            const opponentChangedState = snapshot.changeDataByPlayerId[opponentId];
            const data = {
                ...preparePlayerState(playerChangedState),
                ...prepareOpponentState(opponentChangedState)
            };
            this.emitToPlayer(playerId, 'stateChanged', data);
        }
    }
}

module.exports = MatchComService;

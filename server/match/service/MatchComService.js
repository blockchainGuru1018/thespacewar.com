const LOG_ALL_EMITS = false;

const preparePlayerState = require('./preparePlayerState.js');
const prepareOpponentState = require('./prepareOpponentState.js');

class MatchComService {

    constructor({ matchId, players, logger, matchService, playerServiceProvider, stateChangeListener }) {
        this._matchId = matchId;
        this._players = players;
        this._logger = logger;
        this._matchService = matchService;
        this._playerServiceProvider = playerServiceProvider;
        this._emittedAllState = false;

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

        if (LOG_ALL_EMITS) {
            this._logger.log(
                `[${new Date().toISOString()}] emitToPlayer(${playerId}, ${action}, ${value}) stack: ${new Error().stack}`,
                'match'
            );
        }
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

    emitCurrentStateToPlayers() {
        this._emittedAllState = true;

        for (const player of this.getPlayers()) {
            const playerId = player.id;
            const playerState = this._getPlayerState(playerId);

            let opponentId = this.getOpponentId(playerId);
            const opponentState = this._getPlayerState(opponentId);

            const data = {
                mode: this._matchService.mode(),
                ended: this._matchService.hasGameEnded(),
                playerOrder: this._matchService.getPlayerOrder(),
                retreatedPlayerId: this._matchService.getRetreatedPlayerId(),
                currentPlayer: this._matchService.getCurrentPlayer(),
                turn: this._matchService.getTurn(),
                gameConfigEntity: this._matchService.getGameConfigEntity(),
                ...preparePlayerState(playerState),
                ...prepareOpponentState(opponentState)
            };

            if (Object.keys(data).length > 0) {
                this.emitToPlayer(playerId, 'stateChanged', data);
            }
        }
    }

    _getPlayer(playerId) {
        return this._players.find(p => p.id === playerId);
    }

    _onSnapshot(snapshot) {
        if (this._emittedAllState) return;

        for (const player of this.getPlayers()) {
            const playerId = player.id;
            const playerChangedKeys = snapshot.changedKeysByPlayerId[playerId];
            const playerChangedState = this._getPlayerChangedState(playerId, playerChangedKeys);

            let opponentId = this.getOpponentId(playerId);
            const opponentChangedKeys = snapshot.changedKeysByPlayerId[opponentId];
            const opponentChangedState = this._getPlayerChangedState(opponentId, opponentChangedKeys);

            const data = {
                ...preparePlayerState(playerChangedState),
                ...prepareOpponentState(opponentChangedState)
            };

            if (Object.keys(data).length > 0) {
                this.emitToPlayer(playerId, 'stateChanged', data);
            }
        }
    }

    _getPlayerState(playerId) {
        const playerStateService = this._playerServiceProvider.getStateServiceById(playerId);
        return playerStateService.getPlayerState();
    }

    _getPlayerChangedState(playerId, playerChangedKeys) {
        const playerStateService = this._playerServiceProvider.getStateServiceById(playerId);
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

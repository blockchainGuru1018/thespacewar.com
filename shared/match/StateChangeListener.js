const LOG_ALL_STATE_CHANGES = false;

class StateChangeListener {

    constructor({
        playerServiceProvider,
        matchService,
        logger
    }) {
        this._matchService = matchService;
        this._logger = logger;
        this._snapshotListeners = [];
        this._resetSnapshotData();

        const stateChangeListener = this._onStateChange.bind(this);
        const playerIds = matchService.getPlayerOrder();
        for (const playerId of playerIds) {
            playerServiceProvider
                .getStateServiceById(playerId)
                .listenForChanges(stateChangeListener);
        }
    }

    listenForSnapshots(listener) {
        this._snapshotListeners.push(listener);
    }

    snapshot() {
        const snapshot = this._snapshotData;
        for (const listener of this._snapshotListeners) {
            listener(snapshot);
        }

        this._resetSnapshotData();
    }

    _resetSnapshotData() {
        const snapshotData = { changeDataByPlayerId: {} };
        const playerIds = this._matchService.getPlayerOrder();
        for (const playerId of playerIds) {
            snapshotData.changeDataByPlayerId[playerId] = {};
        }

        this._snapshotData = snapshotData;
    }

    _onStateChange({ property, value, playerId }) {
        this._snapshotData.changeDataByPlayerId[playerId][property] = value;
        const valueString = JSON.stringify(value, null, 4);

        if (LOG_ALL_STATE_CHANGES) {
            this._logger.log(
                `onStateChange ${new Date().toISOString()}: playerId=${playerId}, prop=${property}, value=${valueString}`,
                'playerStateChange'
            );
        }
    }
}

module.exports = StateChangeListener;
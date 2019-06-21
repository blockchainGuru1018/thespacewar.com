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

        const stateTouchedListener = this._onStateTouched.bind(this);
        const playerIds = matchService.getPlayerOrder();
        for (const playerId of playerIds) {
            playerServiceProvider
                .getStateServiceById(playerId)
                .listenForStateTouches(stateTouchedListener);
        }
    }

    listenForSnapshots(listener) {
        this._snapshotListeners.push(listener);
    }

    snapshot() {
        const snapshot = { changedKeysByPlayerId: {} };
        const playerIds = Object.keys(this._snapshotData.changedKeysByPlayerId)
        for (const playerId of playerIds) {
            snapshot.changedKeysByPlayerId[playerId] = Array.from(this._snapshotData.changedKeysByPlayerId[playerId]);
        }

        for (const listener of this._snapshotListeners) {
            listener(snapshot);
        }

        this._resetSnapshotData();
    }

    _resetSnapshotData() {
        const snapshotData = { changedKeysByPlayerId: {} };
        const playerIds = this._matchService.getPlayerOrder();
        for (const playerId of playerIds) {
            snapshotData.changedKeysByPlayerId[playerId] = new Set();
        }

        this._snapshotData = snapshotData;
    }

    _onStateTouched({ property, playerId }) {
        this._snapshotData.changedKeysByPlayerId[playerId].add(property);

        if (LOG_ALL_STATE_CHANGES) {
            this._logger.log(
                `[${new Date().toISOString()}] state touched: playerId=${playerId}, prop=${property}`,
                'playerStateChange'
            );
        }
    }
}

module.exports = StateChangeListener;

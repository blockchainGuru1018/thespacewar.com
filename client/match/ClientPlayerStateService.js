const PlayerStateService = require('../../shared/match/PlayerStateService.js');
const mapFromServerToClientState = require('./mapFromServerToClientState.js');

class ClientPlayerStateService extends PlayerStateService {

    constructor(deps) {
        super(deps);
        this._updateStore = deps.updateStore;
    }

    updateCard(cardId, updateFn) {
        throw new Error('Not implemented');
    }

    updateStationCard(cardId, updateFn) {
        throw new Error('Not implemented');
    }

    storeEvent(event) {
        this.update(state => state.events.push(event));
    }

    update(updateFn) {
        const playerState = this._getPlayerState();
        updateFn(playerState);
        const clientState = mapFromServerToClientState(this._matchService.getState(), this._playerId);
        this._updateStore(clientState);
        return playerState;
    }
}

module.exports = ClientPlayerStateService;
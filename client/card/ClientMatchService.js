const mapFromClientToServerState = require('./mapFromClientToServerState.js');

module.exports = class ClientMatchService {

    setState(state) {
        this._state = mapFromClientToServerState(state);
    }

    getState() {
        return this._state || {};
    }

};
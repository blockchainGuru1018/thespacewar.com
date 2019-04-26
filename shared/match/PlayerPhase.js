const { PHASES } = require('../phases.js');

module.exports = class PlayerPhase {

    constructor({ playerStateService }) {
        this._playerStateService = playerStateService;
    }

    onActionPhase() {
        return this._playerStateService.getPhase() === PHASES.action;
    }
};

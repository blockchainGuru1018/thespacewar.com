const BaseCard = require('./BaseCard.js');

module.exports = class FastMissile extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    canMove() {
        return this._matchInfoRepository.getPlayerPhase(this._playerId) === 'attack';
    }
};

const BaseCard = require('./BaseCard.js');

module.exports = class FullForceForward extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return "8";
    }

    canMoveAndAttackOnSameTurn() {
        return false;
    }
};
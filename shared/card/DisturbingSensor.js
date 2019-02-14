const BaseCard = require('./BaseCard.js');

module.exports = class DisturbingSensor extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '37';
    }

    get preventsOpponentMissilesFromMoving() {
        return true;
    }

    get preventsOpponentMissilesFromAttacking() {
        return true;
    }

    canAttack() {
        return false;
    }
};

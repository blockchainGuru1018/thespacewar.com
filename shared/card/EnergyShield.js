const BaseCard = require('./BaseCard.js');

module.exports = class EnergyShield extends BaseCard {

    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '21';
    }

    stopsStationAttack() {
        return true;
    }

    canOnlyHaveOneInHomeZone() {
        return true;
    }
};

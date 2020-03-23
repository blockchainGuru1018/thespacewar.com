const BaseCard = require('./BaseCard.js');

module.exports = class Shield extends BaseCard {

    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '81';
    }

    stopsStationAttack() {
        return true;
    }
};

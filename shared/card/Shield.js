const BaseCard = require('./BaseCard.js');
const StopsStationAttack = require('./mixins/StopsStationAttack.js');

module.exports = class Shield extends StopsStationAttack(BaseCard) {

    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '81';
    }
};

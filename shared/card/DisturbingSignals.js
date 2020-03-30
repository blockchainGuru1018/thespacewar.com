const BaseCard = require('./BaseCard.js');

const PreventsOpponentMissilesFromAttacking = require('./mixins/PreventsOpponentMissilesFromAttacking.js');
const PreventsOpponentMissilesFromMoving = require('./mixins/PreventsOpponentMissilesFromMoving.js');

module.exports = class DisturbingSignals extends PreventsOpponentMissilesFromAttacking(PreventsOpponentMissilesFromMoving(BaseCard)) {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '91';
    }
};

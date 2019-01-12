const BaseCard = require('./BaseCard.js');
const CanAttackTwice = require('./mixins/CanAttackTwice.js');

module.exports = class TriggerHappyJoe extends CanAttackTwice(BaseCard) {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '24';
    }
};

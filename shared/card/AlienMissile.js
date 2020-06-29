const BaseCard = require('./BaseCard.js');

const Slow = require('./mixins/Slow');

module.exports = class AlienMissile extends Slow(BaseCard) {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '83';
    }
};

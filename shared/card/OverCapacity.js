const BaseCard = require('./BaseCard.js');

module.exports = class OverCapacity extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '13';
    }

    static get grantsUnlimitedHandSize() {
        return true;
    }
};
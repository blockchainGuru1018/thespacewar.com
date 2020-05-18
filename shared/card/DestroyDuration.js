const BaseCard = require('./BaseCard.js');
const Slow = require('./mixins/Slow.js');

module.exports = class DestroyDuration extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '86';
    }
};

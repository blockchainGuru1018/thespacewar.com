const BaseCard = require('./BaseCard.js');
const Slow = require('./mixins/Slow.js');

module.exports = class TheDarkDestroyer extends Slow(BaseCard) {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '2';
    }

    get requirementsWhenPutDownInHomeZone() {
        return {
            forOpponent: [{ type: 'drawCard', count: 2 }],
            forPlayer: []
        };
    }
};

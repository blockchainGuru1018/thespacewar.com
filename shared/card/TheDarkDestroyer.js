const BaseCard = require('./BaseCard.js');

module.exports = class TheDarkDestroyer extends BaseCard {
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

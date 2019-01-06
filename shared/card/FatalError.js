const BaseCard = require('./BaseCard.js');

module.exports = class FatalError extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    get requirementsWhenPutDownInHomeZone() {
        return {
            forOpponent: [{ type: 'drawCard', count: 2 }],
            forPlayer: []
        };
    }

    get actionWhenPutDownInHomeZone() {
        return {
            name: 'destroyAnyCard',
            text: 'Select any card to destroy'
        }
    }
};

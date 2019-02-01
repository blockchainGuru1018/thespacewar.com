const BaseCard = require('./BaseCard.js');

module.exports = class FatalError extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '38';
    }

    get requirementsWhenPutDownInHomeZone() {
        return {
            forOpponent: [{ type: 'drawCard', count: 2 }],
            forPlayer: []
        };
    }

    get actionWhenPutDownInHomeZone() {
        return {
            showCardImage: true,
            showTransientCardInHomeZone: true,
            name: 'destroyAnyCard',
            text: 'Select any card to destroy'
        }
    }
};

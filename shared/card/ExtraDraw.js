const BaseCard = require('./BaseCard.js');

module.exports = class ExtraDraw extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '87';
    }

    get requirementsWhenEnterDrawPhase() {
        const cardCommonId = ExtraDraw.CommonId;
        return {
            forOpponent: [],
            forPlayer: [
                {type: 'drawCard', count: 2, cardCommonId}
            ]
        }
    }
};
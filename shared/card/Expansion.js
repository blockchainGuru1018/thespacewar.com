const BaseCard = require('./BaseCard.js');

module.exports = class Expansion extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '66';
    }

    get eventSpecsWhenPutDownInHomeZone() {
        return [{ type: 'freeExtraStationCardGranted', count: 2 }];
    }

    get requirementsWhenPutDownInHomeZone() {
        return {
            forOpponent: [
                { type: 'drawCard', count: 2, cardCommonId: Expansion.CommonId }
            ],
            forPlayer: []
        };
    }
};
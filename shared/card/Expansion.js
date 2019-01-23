const BaseCard = require('./BaseCard.js');

module.exports = class Expansion extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '40';
    }

    get allowsToPutDownExtraStationCards() {
        return 1;
    }

    get requirementsOnPutDownExtraStationCard() {
        return {
            forOpponent: [
                { type: 'drawCard', count: 2 }
            ],
            forPlayer: []
        };
    }
};

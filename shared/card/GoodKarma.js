const BaseCard = require('./BaseCard.js');

class GoodKarma extends BaseCard {
    constructor(deps) {
        super(deps);

        this._matchService = deps.matchService;
    }

    static get CommonId() {
        return '11';
    }

    get requirementsWhenEnterDrawPhase() {
        const cardCommonId = this.commonId;
        return {
            forOpponent: [],
            forPlayer: [
                { type: 'drawCard', count: 3, cardCommonId }
            ]
        }
    }

    get requirementsWhenLeavingDrawPhase() {
        const cardCommonId = this.commonId;
        return {
            forOpponent: [],
            forPlayer: [
                { type: 'discardCard', count: 1, cardCommonId }
            ]
        }
    }
}

module.exports = GoodKarma;
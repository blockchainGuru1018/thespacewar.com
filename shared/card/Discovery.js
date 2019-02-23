const BaseCard = require('./BaseCard.js');

module.exports = class Discover extends BaseCard {
    constructor(deps) {
        super(deps);

        this._matchService = deps.matchService;
    }

    static get CommonId() {
        return '42';
    }

    get choicesWhenPutDownInHomeZone() {
        return [
            { name: 'draw', text: 'Draw 4 cards and the opponent draws 3 cards' },
            { name: 'discard', text: 'Discard 1 card and the opponent discards 2 cards' }
        ];
    }
};
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
            { name: 'draw', text: 'Each player draws 4 cards' },
            { name: 'discard', text: 'Each player discards 2 cards' }
        ];
    }
};
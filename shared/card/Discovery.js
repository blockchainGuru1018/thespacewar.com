const BaseCard = require('./BaseCard.js');

module.exports = class Discover extends BaseCard {
    constructor(deps) {
        super(deps);

        this._matchService = deps.matchService;
    }

    get choicesWhenPutDownInHomeZone() {
        return [
            { name: 'draw', text: 'Each player draws 4 cards' },
            { name: 'discard', text: 'Each player discards 2 cards' }
        ];
    }
};
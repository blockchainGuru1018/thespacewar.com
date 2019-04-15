const BaseCard = require('./BaseCard.js');

class DestinyDecided extends BaseCard {

    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '64';
    }

    get preventsAnyPlayerFromPlayingAnEventCard() {
        return true;
    }
}

module.exports = DestinyDecided;
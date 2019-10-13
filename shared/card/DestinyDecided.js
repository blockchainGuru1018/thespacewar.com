const BaseCard = require('./BaseCard.js');

class DestinyDecided extends BaseCard {

    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '64';
    }

    get preventsOpponentFromPlayingAnEventCard() {
        return true;
    }

    get preventsPlayerFromPlayingAnyCards() {
        return true;
    }

    get limitsOpponentToPlayingMaxCardCount() {
        return 1;
    }
}

module.exports = DestinyDecided;

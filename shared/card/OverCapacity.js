const Info = require('./info/13.config.js');
const BaseCard = require('./BaseCard.js');

module.exports = class OverCapacity extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '13';
    }

    static get Info() {
        return Info;
    }

    get info() {
        return Info;
    }

    get grantsUnlimitedHandSize() {
        return true;
    }

    get grantsAbilityToLookAtHandSizeStationRow() {
        return true;
    }

    canLookAtHandSizeStationRow() {
        return this._playerPhase.isAction();
    }
};

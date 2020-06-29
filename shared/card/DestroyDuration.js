const BaseCard = require('./BaseCard.js');
const CanBeSacrified = require('./mixins/CanBeSacrificed.js');

module.exports = class DestroyDuration extends CanBeSacrified(BaseCard) {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '86';
    }

    canTargetCardForSacrifice(otherCard) {
        if (!otherCard.canBeTargeted()) return false;
        if (otherCard.type !== 'duration') return false;
        if (otherCard.playerId === this.playerId) return false;

        return true;
    }

};

const info = require('./info/38.config.js');
const BaseCard = require('./BaseCard.js');
const FatalErrorDestroyCardAction = require('./fatalError/FatalErrorDestroyCardAction.js');

module.exports = class FatalError extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get Info() {
        return info;
    }

    static get CommonId() {
        return info.CommonId;
    }

    get actionWhenPutDownInHomeZone() {
        return new FatalErrorDestroyCardAction({ playerId: this.playerId });
    }
};

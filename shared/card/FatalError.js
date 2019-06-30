const info = require('./info/38.config.js');
const BaseCard = require('./BaseCard.js');

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
        return {
            showCardImage: true,
            showTransientCardInHomeZone: true,
            name: 'destroyAnyCard',
            text: 'Select any card to destroy'
        }
    }
};

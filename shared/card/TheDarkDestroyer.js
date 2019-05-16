const BaseCard = require('./BaseCard.js');
const Slow = require('./mixins/Slow.js');

module.exports = class TheDarkDestroyer extends Slow(BaseCard) {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '2';
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

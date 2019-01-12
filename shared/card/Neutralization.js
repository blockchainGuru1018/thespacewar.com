const BaseCard = require('./BaseCard.js');

class Neutralization extends BaseCard {

    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '12';
    }

    get disablesDurationCards() {
        return true;
    }
}

module.exports = Neutralization;
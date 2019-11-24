const info = require('./info/12.config.js');
const BaseCard = require('./BaseCard.js');

class Neutralization extends BaseCard {

    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return info.CommonId;
    }

    static get Info() {
        return info;
    }

    get disablesDurationCards() {
        return true;
    }
}

module.exports = Neutralization;

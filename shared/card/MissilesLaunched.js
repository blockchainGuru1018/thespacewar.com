const info = require('./info/17.json');
const BaseCard = require('./BaseCard.js');

class MissilesLaunched extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return "17";
    }

    static get info() {
        return info;
    }

    get requirementSpecsWhenPutDownInHomeZone() {
        return info.requirementSpecsWhenPutDownInHomeZone;
    }
}

module.exports = MissilesLaunched;
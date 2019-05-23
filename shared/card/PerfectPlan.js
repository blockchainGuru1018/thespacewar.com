const info = require('./info/18.json');
const BaseCard = require('./BaseCard.js');

module.exports = class PerfectPlan extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return "18";
    }

    static get Info() {
        return info;
    }
};

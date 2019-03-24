const BaseCard = require('./BaseCard.js');

module.exports = class PerfectPlan extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return "18";
    }
};
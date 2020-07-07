const BaseCard = require("./BaseCard.js");
const CanAttackTwice = require("./mixins/CanAttackTwice.js");

module.exports = class SmallCannon extends CanAttackTwice(BaseCard) {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return "23";
    }
};

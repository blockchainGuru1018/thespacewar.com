const BaseCard = require("./BaseCard.js");

const Slow = require("./mixins/Slow");

module.exports = class AlienMissile extends Slow(BaseCard) {
  constructor(deps) {
    super(deps);
  }

  get damageGoesThroughShield() {
    return true;
  }

  static get CommonId() {
    return "83";
  }
};

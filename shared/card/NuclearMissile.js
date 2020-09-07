const BaseCard = require("./BaseCard.js");
const Slow = require("./mixins/Slow.js");

module.exports = class NuclearMissile extends Slow(BaseCard) {
  constructor(deps) {
    super(deps);
  }

  get damageGoesThroughShield() {
    return true;
  }

  static get CommonId() {
    return "8";
  }
};

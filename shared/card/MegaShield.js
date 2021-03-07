const BaseCard = require("./BaseCard.js");
const StopsStationAttack = require("./mixins/StopsStationAttack.js");

class MegaShield extends StopsStationAttack(BaseCard) {
  constructor(deps) {
    super(deps);
  }

  get selfRepairAtDrawPhase() {
    return 2;
  }

  repairSelf() {
    this.damage = Math.max(0, this.damage - this.selfRepairAtDrawPhase);
  }

  static get CommonId() {
    return "204";
  }
}
module.exports = MegaShield;

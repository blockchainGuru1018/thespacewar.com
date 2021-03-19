const BaseCard = require("./BaseCard.js");
const info = require("./info/219.config");
class GoodPlan extends BaseCard {
  constructor(deps) {
    super(deps);
  }
  static get CommonId() {
    return info.CommonId;
  }
  static get Info() {
    return info;
  }
}

module.exports = GoodPlan;

const BaseCard = require("./BaseCard.js");

class GreatDisturbance extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "211";
  }
}

module.exports = GreatDisturbance;

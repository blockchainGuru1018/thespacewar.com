const BaseCard = require("./BaseCard.js");

module.exports = class TheParalyzer extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "85";
  }
};

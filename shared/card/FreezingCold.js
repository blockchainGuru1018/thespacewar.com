const BaseCard = require("./BaseCard.js");

module.exports = class FreezingCold extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "89";
  }

  get allCardsCostIncrementEffect() {
    return 3;
  }
};

const info = require("./info/213.config.js");
const BaseCard = require("./BaseCard.js");

module.exports = class SurpriseAttack extends BaseCard {
  static get CommonId() {
    return info.CommonId;
  }

  static get Info() {
    return info;
  }

  get canCounterAttacks() {
    return true;
  }
};

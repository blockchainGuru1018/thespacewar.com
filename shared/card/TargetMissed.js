const info = require("./info/16.config.js");
const BaseCard = require("./BaseCard.js");
const CanBePutDownAnyTime = require("./mixins/CanBePutDownAnyTime.js");

module.exports = class TargetMissed extends CanBePutDownAnyTime(BaseCard) {
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

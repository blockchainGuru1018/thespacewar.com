const info = require("./info/31.config.js");
const BaseCard = require("./BaseCard.js");
const CanCounterCardsWithCostOrLess = require("./mixins/CanCounterCardsWithCostOrLess.js");
const CanBePutDownAnyTime = require("./mixins/CanBePutDownAnyTime.js");

module.exports = class Luck extends CanBePutDownAnyTime(
  CanCounterCardsWithCostOrLess(2, BaseCard)
) {
  static get CommonId() {
    return info.CommonId;
  }

  static get Info() {
    return info;
  }

  get choicesWhenPutDownInHomeZone() {
    return info.choicesWhenPutDownInHomeZone;
  }
};

const BaseCard = require("./BaseCard.js");
const info = require("./info/86.config");
module.exports = class DestroyDuration extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "86";
  }

  static get Info() {
    return info;
  }

  get choicesWhenPutDownInHomeZone() {
    return info.choicesWhenPutDownInHomeZone;
  }
};

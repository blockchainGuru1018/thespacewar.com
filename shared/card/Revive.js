const BaseCard = require("./BaseCard.js");
const info = require("./info/88.config.js");

module.exports = class Revive extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "88";
  }

  static get Info() {
    return info;
  }
};

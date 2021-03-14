const BaseCard = require("./BaseCard.js");
const info = require("./info/225.config.js");

module.exports = class ResourceShip extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return info.CommonId;
  }

  static get Info() {
    return info;
  }
};

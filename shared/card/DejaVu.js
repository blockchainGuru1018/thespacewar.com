const BaseCard = require("./BaseCard.js");
const info = require("./info/208.config");

class DejaVu extends BaseCard {
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

module.exports = DejaVu;

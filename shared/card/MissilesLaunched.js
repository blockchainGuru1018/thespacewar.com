const info = require("./info/17.json");
const BaseCard = require("./BaseCard.js");

class MissilesLaunched extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "17";
  }

  static get Info() {
    return info;
  }
}

module.exports = MissilesLaunched;

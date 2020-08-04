const BaseCard = require("./BaseCard.js");

class Electrocution extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "214";
  }
}

module.exports = Electrocution;

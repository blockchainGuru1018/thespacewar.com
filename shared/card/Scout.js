const BaseCard = require("./BaseCard.js");
module.exports = class Scout extends BaseCard {
  constructor(deps) {
    super(deps);
  }
  static get CommonId() {
    return "226";
  }
};

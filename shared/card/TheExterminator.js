const BaseCard = require("./BaseCard.js");
const Slow = require("./mixins/Slow.js");

module.exports = class TheExterminator extends Slow(BaseCard) {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "1";
  }
};

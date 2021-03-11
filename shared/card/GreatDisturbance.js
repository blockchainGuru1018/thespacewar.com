const BaseCard = require("./BaseCard.js");

class GreatDisturbance extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  //TODO: should also find diferrent cards with same effect
  // canTriggerDormantEffect() {
  //   return this.isTheLatestPlayedCardOfSameKind();
  // }
  static get CommonId() {
    return "211";
  }
}

module.exports = GreatDisturbance;

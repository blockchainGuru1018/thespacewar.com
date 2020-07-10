const BaseCard = require("./BaseCard.js");

module.exports = class TheParalyzer extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "85";
  }

  attackCard(defenderCard) {
    if (defenderCard.type === "spaceShip") {
      defenderCard.paralyzed = true;
    }
    super.attackCard(defenderCard);
  }
};

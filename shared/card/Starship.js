const BaseCard = require("./BaseCard.js");
const Slow = require("./mixins/Slow");

class Starship extends Slow(BaseCard) {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "228";
  }

  get costInflation() {
    const preCost =
      (this._cardEffect.costCardIncrement() || 0) -
      this._playerStateService.getCardsInPlay().length;
    return Math.abs(preCost) > this.baseCost ? -this.baseCost : preCost;
  }
}

module.exports = Starship;

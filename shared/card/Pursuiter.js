const BaseCard = require("./BaseCard.js");
const CanBeSacrified = require("./mixins/CanBeSacrificed.js");

module.exports = class Pursuiter extends CanBeSacrified(BaseCard) {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "19";
  }

  canTargetCardForSacrifice(otherCard) {
    if (!this.canBeSacrificed()) return false; // TODO Remove, see if any tests fail

    if (otherCard.isStationCard()) {
      return this.canTargetStationCardsForSacrifice();
    } else {
      return this.canTargetCard(otherCard);
    }
  }

  canTargetStationCardsForSacrifice() {
    return !this.isInHomeZone() && !this._hasMovedThisTurn();
  }
};

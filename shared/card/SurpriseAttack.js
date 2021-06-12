const info = require("./info/213.config.js");
const BaseCard = require("./BaseCard.js");

module.exports = class SurpriseAttack extends BaseCard {
  static get CommonId() {
    return info.CommonId;
  }

  static get Info() {
    return info;
  }

  get canCounterAttacks() {
    return true;
  }

  canBePlayed() {
    return super.canBePlayed() && this._opponentHaveAnySpaceShipAtPlay();
  }

  _opponentHaveAnySpaceShipAtPlay() {
    return this._queryBoard.opponentHasCardInPlay(
      (card) => card.type === "spaceShip"
    );
  }
};

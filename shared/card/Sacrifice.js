const BaseCard = require("./BaseCard.js");
const info = require("./info/94.config.js");

module.exports = class DestroyDuration extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "94";
  }
  static get Info() {
    return info;
  }
  canBePlayed() {
    if (this._playerStateService.getCardsInPlayForPlayersCount() > 0)
      return super.canBePlayed();
    else return false;
  }
};

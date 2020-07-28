const info = require("./info/78.config.js");
const BaseCard = require("./BaseCard.js");
const Commander = require("../../shared/match/commander/Commander.js");
module.exports = class Drone extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  get attack() {
    return this._card.attack + this.attackBoost;
  }

  get attackBoost() {
    const isPlayingWithCrakux =
      this._playerStateService.getCurrentCommander() === Commander.Crakux;
    return (
      this._cardEffect.attackBoostForCardType(this.type) +
      (isPlayingWithCrakux ? 1 : 0)
    );
  }

  static get Info() {
    return info;
  }

  static get CommonId() {
    return info.CommonId;
  }
};

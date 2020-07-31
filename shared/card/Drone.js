const info = require("./info/78.config.js");
const BaseCard = require("./BaseCard.js");
const Commander = require("../../shared/match/commander/Commander.js");
module.exports = class Drone extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  get attackBoostFromCommander() {
    const isPlayingWithCrakux =
      this._playerStateService.getCurrentCommander() === Commander.Crakux;
    return isPlayingWithCrakux ? 1 : 0;
  }

  static get Info() {
    return info;
  }

  static get CommonId() {
    return info.CommonId;
  }
};

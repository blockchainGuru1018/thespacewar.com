const BaseCard = require("./BaseCard.js");
const info = require("./info/221.config");
module.exports = class DeployStarship extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return info.CommonId;
  }

  static get Info() {
    return info;
  }

  canBePlayed() {
    return super.canBePlayed() && this._thereAreAtLeastThreeCardsInPlay();
  }

  get requirementsWhenPutDown() {
    return info.requirementSpecsWhenPutDownInHomeZone;
  }

  _thereAreAtLeastThreeCardsInPlay() {
    return this._playerStateService.getCardsInPlay().length >= 3;
  }
};

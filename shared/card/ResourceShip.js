const BaseCard = require("./BaseCard.js");

class ResourceShip extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "225";
  }

  get canBePutDownAsExtraStationCard() {
    return true;
  }
}

module.exports = ResourceShip;

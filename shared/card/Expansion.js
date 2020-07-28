const info = require("./info/66.config.js");
const BaseCard = require("./BaseCard.js");

module.exports = class Expansion extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get Info() {
    return info;
  }

  static get CommonId() {
    return info.CommonId;
  }

  get eventSpecsWhenPutDownInHomeZone() {
    return [
      {
        type: "freeExtraStationCardGranted",
        count: 2,
        cardCost: this.costToPlay,
      },
    ];
  }
};

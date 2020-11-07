const BaseCard = require("./BaseCard.js");
const AllowFriendlySpaceShipsToMoveTurnWhenPutDown = require("./mixins/AllowsFriendlySpaceShipsToMoveTurnWhenPutDown");
//TODO: rename to Nitro
module.exports = class Fast extends AllowFriendlySpaceShipsToMoveTurnWhenPutDown(
  BaseCard
) {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "95";
  }
};

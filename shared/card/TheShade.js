const BaseCard = require("./BaseCard.js");

module.exports = class TheShade extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return "27";
  }

  canBeTargeted() {
    const playerOrder = this._matchService.getPlayerOrder();
    const isLastPlayer = playerOrder[playerOrder.length - 1] === this.playerId;
    const currentTurn = this._matchInfoRepository.getTurn();

    const turn = isLastPlayer ? currentTurn - 1 : currentTurn;
    const attackEvents = this._queryEvents.getAttacksOnTurn(this.id, turn);

    return attackEvents.length > 0;
  }
};

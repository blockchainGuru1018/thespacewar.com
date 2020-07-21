const BaseCard = require("./BaseCard.js");
const info = require("./info/80.config.js");

module.exports = class Fusion extends BaseCard {
  constructor(deps) {
    super(deps);
  }

  static get CommonId() {
    return info.CommonId;
  }

  static get info() {
    return info;
  }

  canTriggerDormantEffect() {
    const turnCardWasPutDown = this._queryEvents.getTurnWhenCardWasPutDown(
      this.id
    );
    const currentTurn = this._matchService.getTurn();
    const itsNotSameTurnWhenWasPuttedDown = turnCardWasPutDown < currentTurn;
    const haveNotAttackedThisTurn = !this._hasAttackedThisTurn();
    const existTwoOrMoreSpaceShipsInSameZone = this._playerStateService.hasMatchingCardInSameZone(
      this.id,
      (card) => card.type === "spaceShip"
    );
    return (
      existTwoOrMoreSpaceShipsInSameZone &&
      itsNotSameTurnWhenWasPuttedDown &&
      haveNotAttackedThisTurn
    );
  }

  triggerDormantEffect() {
    const spec = Fusion.info.dormantEffectRequirementSpec;
    // this._addRequirementFromSpec.forCardAndSpec(this, spec);
  }
};

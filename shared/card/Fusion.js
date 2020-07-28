const BaseCard = require("./BaseCard.js");
const info = require("./info/80.config.js");
const { PHASES } = require("../phases.js");
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

    const itsNotSameTurnWhenWasPuttedDown =
      turnCardWasPutDown < this._matchService.getTurn();
    const haveNotAttackedThisTurn = !this._hasAttackedThisTurn();

    const existTwoOrMoreSpaceShipsInSameZone =
      this._playerStateService
        .getMatchingCardInSameZone(this.id, (card) => card.type === "spaceShip")
        .filter((card) => card.id !== this.id).length >= 2;
    const isAttackPhase = this._playerStateService.getPhase() === PHASES.attack;
    return (
      !this.paralyzed &&
      existTwoOrMoreSpaceShipsInSameZone &&
      itsNotSameTurnWhenWasPuttedDown &&
      haveNotAttackedThisTurn &&
      isAttackPhase
    );
  }

  triggerDormantEffect() {
    const spec = Fusion.info.dormantEffectRequirementSpec;
    this._addRequirementFromSpec.forCardAndSpec(this, spec);
  }
};

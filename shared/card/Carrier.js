const BaseCard = require("./BaseCard.js");
const info = require("./info/77.config.js");
const { PHASES } = require("../phases.js");

module.exports = class Carrier extends BaseCard {
  constructor({ addRequirementFromSpec, ...deps }) {
    super(deps);
    this._addRequirementFromSpec = addRequirementFromSpec;
  }

  static get CommonId() {
    return info.CommonId;
  }

  canTriggerDormantEffect() {
    const lastTurnWhenDormantEffectWasUsed = this._queryEvents.getTurnWhenCardDormantEffectWasUsed(
      this.id
    );
    const turnWhenCardWasPutDown = this._queryEvents.getTurnWhenCardWasPutDown(
      this.id
    );
    const turn = this._matchService.getTurn();
    const isAttackPhase = this._playerStateService.getPhase() === PHASES.attack;
    return (
      turnWhenCardWasPutDown < turn &&
      lastTurnWhenDormantEffectWasUsed !== turn &&
      isAttackPhase &&
      !this.paralyzed
    );
  }

  static get Info() {
    return info;
  }

  triggerDormantEffect() {
    const spec = Carrier.Info.dormantEffectRequirementSpec;
    this._addRequirementFromSpec.forCardAndSpec(this, spec);
  }
};

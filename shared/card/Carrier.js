const BaseCard = require("./BaseCard.js");
const info = require("./info/77.config.js");

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

    return (
      turnWhenCardWasPutDown < turn &&
      lastTurnWhenDormantEffectWasUsed !== turn &&
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

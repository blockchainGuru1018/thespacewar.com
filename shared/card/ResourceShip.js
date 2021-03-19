const BaseCard = require("./BaseCard.js");
const info = require("./info/225.config.js");
const { PHASES } = require("../phases.js");
module.exports = class ResourceShip extends BaseCard {
  constructor(deps) {
    super(deps);
    this._addRequirementFromSpec = deps.addRequirementFromSpec;
  }

  static get CommonId() {
    return info.CommonId;
  }
  static get Info() {
    return info;
  }
  canTriggerDormantEffect(nextPhase = null) {
    return true;
    // const turnWhenCardWasPutDown = this._queryEvents.getTurnWhenCardWasPutDown(
    //   this.id
    // );
    // const turn = this._matchService.getTurn();
    // const isAttackPhase = this._playerStateService.getPhase() === PHASES.attack;
    // return turnWhenCardWasPutDown < turn && isAttackPhase && !this.paralyzed;
  }

  triggerDormantEffect() {
    const spec = ResourceShip.Info.dormantEffectRequirementSpec;
    this._addRequirementFromSpec.forCardAndSpec(this, spec);
  }

  get canBePutDownAsExtraStationCard() {
    return true;
  }
};

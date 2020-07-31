const BaseCard = require("./BaseCard.js");
const info = require("./info/226.config.js");
const { PHASES } = require("../phases.js");

class Scout extends BaseCard {
  constructor(deps) {
    super(deps);
  }
  static get CommonId() {
    return info.CommonId;
  }

  static get Info() {
    return info;
  }
  canAttack() {
    const lastTurnWhenDormantEffectWasUsed = this._queryEvents.getTurnWhenCardDormantEffectWasUsed(
      this.id
    );
    const currentTurn = this._matchService.getTurn();
    const haveNotUsedDormantEffectThisTurn =
      lastTurnWhenDormantEffectWasUsed !== currentTurn;

    return super.canAttack() && haveNotUsedDormantEffectThisTurn;
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
    const haveNotAttackedOnTurn =
      this._queryEvents.getAttacksOnTurn(this.id, turn).length === 0;
    return (
      turnWhenCardWasPutDown < turn &&
      lastTurnWhenDormantEffectWasUsed !== turn &&
      isAttackPhase &&
      !this.paralyzed &&
      haveNotAttackedOnTurn
    );
  }

  triggerDormantEffect() {
    const spec = Scout.Info.dormantEffectRequirementSpec;
    this._addRequirementFromSpec.forCardAndSpec(this, spec);
  }
}

module.exports = Scout;

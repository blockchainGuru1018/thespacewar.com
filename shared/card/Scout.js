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

  canTriggerDormantEffect(nextPhase = null) {
    const lastTurnWhenDormantEffectWasUsed = this._queryEvents.getTurnWhenCardDormantEffectWasUsed(
      this.id
    );
    const currentPhase = nextPhase || this._playerStateService.getPhase();
    const turn = this._matchService.getTurn();
    const isAttackPhaseOrFirstActionPhase = currentPhase === PHASES.attack;
    const haveNotAttackedOnTurn =
      this._queryEvents.getAttacksOnTurn(this.id, turn).length === 0;

    return (
      lastTurnWhenDormantEffectWasUsed !== turn &&
      isAttackPhaseOrFirstActionPhase &&
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

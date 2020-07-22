const Commander = require("../commander/Commander.js");
const AcidProjectile = require("../../../shared/card/AcidProjectile.js");
const findAcidMissileRequirement = {
  forOpponent: [],
  forPlayer: [
    {
      type: "findCard",
      count: 2,
      actionPointsLimit: 6,
      sources: ["discardPile"],
      target: "homeZone",
      filter: {
        commonId: AcidProjectile.CommonId,
      },
      submitOnEverySelect: true,
      cancelable: true,
    },
  ],
};

class FindAcidMissile {
  constructor({
    playerStateService,
    playerPhase,
    playerActionPointsCalculator,
    addRequirementFromSpec,
  }) {
    this._playerStateService = playerStateService;
    this._playerPhase = playerPhase;
    this._playerActionPointsCalculator = playerActionPointsCalculator;
    this._addRequirementFromSpec = addRequirementFromSpec;
  }

  canIssueFindAcidMissile() {
    return (
      this._isUsingStauxCommander() &&
      this._playerPhase.isAction() &&
      this._canAffordFindAcidMissile()
    );
  }

  _isUsingStauxCommander() {
    return this._playerStateService.getCurrentCommander() === Commander.Staux;
  }
  _canAffordFindAcidMissile() {
    return this._playerActionPointsCalculator.calculate() >= 2;
  }

  findAcidMissile() {
    this._addRequirementFromSpec.forReasonAndSpec(
      "StauxFindMissile",
      findAcidMissileRequirement
    );
  }
}

module.exports = FindAcidMissile;

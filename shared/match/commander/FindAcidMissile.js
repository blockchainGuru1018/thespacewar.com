const Commander = require("../commander/Commander.js");
const AcidProjectile = require("../../../shared/card/AcidProjectile.js");
const findAcidMissileRequirement = {
  type: "findCard",
  count: 1,
  sources: [
    "deck",
    "discardPile",
    "drawStationCards",
    "actionStationCards",
    "handSizeStationCards",
  ],
  target: "homeZone",
  filter: {
    commonId: AcidProjectile.CommonId,
  },
  submitOnEverySelect: true,
  cancelable: true,
};

class FindAcidMissile {
  constructor({
    playerStateService,
    playerPhase,
    playerActionPointsCalculator,
    opponentActionLog,
    addRequirementFromSpec,
    playerRequirementFactory,
    playerRequirementService,
    matchService,
  }) {
    this._playerStateService = playerStateService;
    this._playerPhase = playerPhase;
    this._playerActionPointsCalculator = playerActionPointsCalculator;
    this._addRequirementFromSpec = addRequirementFromSpec;
    this._opponentActionLog = opponentActionLog;
    this._playerRequirementFactory = playerRequirementFactory;
    this._playerRequirementService = playerRequirementService;
    this._matchService = matchService;
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
  _createAndStoreEvent() {
    const turn = this._matchService.getTurn();
    const event = { turn, type: "stauxFindAcidMissile" };
    this._playerStateService.storeEvent(event);
  }

  findAcidMissile() {
    const requirement = this._playerRequirementFactory.createForCardAndSpec(
      {},
      findAcidMissileRequirement
    );
    delete requirement.card;

    this._playerRequirementService.addFindCardRequirement(requirement);
    this._createAndStoreEvent();
    this._opponentActionLog.opponentIssuedFindAcidMissile();
  }
}

module.exports = FindAcidMissile;

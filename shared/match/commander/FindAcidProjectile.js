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
    "hand",
  ],
  target: "homeZone",
  filter: {
    commonId: AcidProjectile.CommonId,
  },
};

class FindAcidProjectile {
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

  canIssueFindAcidProjectile() {
    return (
      this._isUsingStauxCommander() &&
      this._playerPhase.isAction() &&
      this._canAffordFindAcidProjectile() &&
      this._hasNotIssuedFindAcidProjectileThisTurn()
    );
  }

  _isUsingStauxCommander() {
    return this._playerStateService.getCurrentCommander() === Commander.Staux;
  }

  _canAffordFindAcidProjectile() {
    return this._playerActionPointsCalculator.calculate() >= 2;
  }

  _createAndStoreEvent() {
    const turn = this._matchService.getTurn();
    const event = { turn, type: "stauxFindAcidProjectile" };
    this._playerStateService.storeEvent(event);
  }

  _hasNotIssuedFindAcidProjectileThisTurn() {
    return (
      this._playerStateService
        .getEvents()
        .filter(
          (e) =>
            e.type === "stauxFindAcidProjectile" &&
            e.turn === this._matchService.getTurn()
        ).length === 0
    );
  }
  findAcidProjectile() {
    const requirement = this._playerRequirementFactory.createForCardAndSpec(
      {},
      findAcidMissileRequirement
    );
    delete requirement.card;

    this._playerRequirementService.addFindCardRequirement(requirement);
    this._createAndStoreEvent();
    this._opponentActionLog.opponentIssuedFindAcidProjectile();
  }
}

module.exports = FindAcidProjectile;

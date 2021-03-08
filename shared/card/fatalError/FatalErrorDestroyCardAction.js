module.exports = class FatalErrorDestroyCardAction {
  constructor({ playerId }) {
    this._playerId = playerId;
  }

  get showCardImage() {
    return true;
  }

  get showTransientCardInHomeZone() {
    return false;
  }

  get name() {
    return "destroyAnyCard";
  }

  get text() {
    return "Select any card to destroy";
  }

  validTarget(target, actionPoints = 0) {
    return (
      this.canTargetFromCostPenaltyAbility(target, actionPoints) &&
      this._isEnemyNonStationCard(target)
    );
  }

  canTargetFromCostPenaltyAbility(target, actionPoints) {
    return target.costToPlay <= actionPoints;
  }

  _isEnemyNonStationCard(target) {
    return this._isEnemyTarget(target) && !target.isStationCard();
  }

  _isEnemyTarget(target) {
    return target.isOpponentCard(this._playerId);
  }
};

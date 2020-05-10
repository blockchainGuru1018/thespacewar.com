module.exports = class FatalErrorDestroyCardAction {

    constructor({ playerId, fatalErrorCost }) {
        this._playerId = playerId;
        this._fatalErrorCost = fatalErrorCost;
    }

    get showCardImage() {
        return true;
    }

    get showTransientCardInHomeZone() {
        return true;
    }

    get name() {
        return 'destroyAnyCard';
    }

    get text() {
        return 'Select any card to destroy';
    }

    validTarget(target) {
        return target.cost === this._fatalErrorCost
            && (this._isFlippedEnemyStationCard(target)
            || this._isEnemyNonStationCard(target));
    }

    _isFlippedEnemyStationCard(target) {
        return this._isEnemyTarget(target) && target.isStationCard() && target.flipped;
    }

    _isEnemyNonStationCard(target) {
        return this._isEnemyTarget(target) && !target.isStationCard();
    }

    _isEnemyTarget(target) {
        return target.isOpponentCard(this._playerId);
    }
};

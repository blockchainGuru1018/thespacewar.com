module.exports = class FatalErrorDestroyCardAction {

    constructor({ playerId }) {
        this._playerId = playerId;
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
        return this._isFlippedEnemyStationCard(target)
            || this._isEnemyNonStationCard(target);
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

const BaseCard = require('./BaseCard.js');

module.exports = class DeadlySniper extends BaseCard {
    constructor(deps) {
        super({ ...deps });
    }

    static get CommonId() {
        return '39';
    }

    canAttackCardsInOtherZone() {
        const currentTurn = this._matchService.getTurn();
        const turnsSinceWasPutDown = currentTurn - this._queryEvents.getTurnWhenCardWasPutDown(this.id);
        return turnsSinceWasPutDown > 0;
    }
};

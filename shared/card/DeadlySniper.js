const BaseCard = require('./BaseCard.js');

module.exports = class DeadlySniper extends BaseCard {
    constructor(deps) {
        super({ ...deps });

        this._matchService = deps.matchService;
    }

    static get CommonId() {
        return '39';
    }

    canAttackCardsInOtherZone() {
        let currentTurn = this._matchService.getTurn();
        let turnsSinceWasPutDown = currentTurn - this._queryEvents.getTurnWhenCardWasPutDown(this.id);
        return turnsSinceWasPutDown > 0;
    }
};
const BaseCard = require('./BaseCard.js');
const { PHASES } = require("../phases");

module.exports = class Pursuiter extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '19';
    }

    canBeSacrificed() {
        if (this.paralyzed) return false;

        const currentTurn = this._matchService.getTurn();
        const turnWhenWasPutDown = this._queryEvents.getTurnWhenCardWasPutDown(this.id);
        if (turnWhenWasPutDown === currentTurn) return false;

        const attacksOnTurn = this._queryEvents.getAttacksOnTurn(this.id, currentTurn);
        if (attacksOnTurn.length > 0) return false;

        return this._getCurrentPhase() === PHASES.attack;
    }
};

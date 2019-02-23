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
        const attacksOnTurn = this._queryEvents.getAttacksOnTurn(this.id, currentTurn)
        const playerPhase = this._playerStateService.getPhase()
        return playerPhase === PHASES.attack && attacksOnTurn.length === 0;
    }
};

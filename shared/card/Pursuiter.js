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
        const currentTurn = this._matchInfoRepository.getTurn();
        const attacksOnTurn = this._queryEvents.getAttacksOnTurn(this.id, currentTurn)
        const playerPhase = this._matchInfoRepository.getPlayerPhase(this.playerId)
        return playerPhase === PHASES.attack && attacksOnTurn.length === 0;
    }
};

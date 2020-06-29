const BaseCard = require('./BaseCard.js');
const {PHASES} = require("../phases");

module.exports = class DestroyDuration extends BaseCard {
    constructor(deps) {
        super(deps);
    }

    static get CommonId() {
        return '86';
    }

    // TODO: this logic will be probably repeated with different arguments find a way to avoid it
    canBeSacrificed() {
        if (this.paralyzed) return false;

        const currentTurn = this._matchService.getTurn();
        const turnWhenWasPutDown = this._queryEvents.getTurnWhenCardWasPutDown(this.id);
        if (turnWhenWasPutDown === currentTurn) return false;

        const attacksOnTurn = this._queryEvents.getAttacksOnTurn(this.id, currentTurn);
        if (attacksOnTurn.length > 0) return false;

        return this._getCurrentPhase() === PHASES.attack;
    }

    canTargetCardForSacrifice(otherCard) {
        if (!otherCard.canBeTargeted()) return false;
        if (otherCard.type !== 'duration') return false;
        if (otherCard.playerId === this.playerId) return false;

        return true;
    }

};

const { PHASES } = require("../../phases");

module.exports = (superclass) =>
    class extends superclass {
        canBeSacrificed() {
            if (this.paralyzed) return false;

            const currentTurn = this._matchService.getTurn();
            const turnWhenWasPutDown = this._queryEvents.getTurnWhenCardWasPutDown(
                this.id
            );
            if (turnWhenWasPutDown === currentTurn) return false;

            const attacksOnTurn = this._queryEvents.getAttacksOnTurn(
                this.id,
                currentTurn
            );
            if (attacksOnTurn.length > 0) return false;

            return this._getCurrentPhase() === PHASES.attack;
        }
    };

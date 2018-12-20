module.exports = superclass => class extends superclass {
    canMove(alternativeConditions = {}) {
        if (this.hasMovedThisTurn()) return false;

        const phase = alternativeConditions.phase || this._matchInfoRepository.getPlayerPhase(this._playerId);
        return phase === 'attack';
    }
};
module.exports = superclass => class extends superclass {
    canMove(alternativeConditions = {}) {
        const phase = alternativeConditions.phase || this._matchInfoRepository.getPlayerPhase(this._playerId);
        return phase === 'attack';
    }
};
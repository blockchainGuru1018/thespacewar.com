module.exports = superclass => class extends superclass {
    canMove() {
        return this._matchInfoRepository.getPlayerPhase(this._playerId) === 'attack';
    }
};
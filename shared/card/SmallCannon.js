const BaseCard = require('./BaseCard.js');

class SmallCannon extends BaseCard {

    constructor(deps) {
        super(deps);
    }

    canAttack() {
        const turn = this._matchInfoRepository.getTurn();
        const attacks = this._queryEvents.getAttacksOnTurn(this._card.id, turn);
        const currentPlayerPhase = this._matchInfoRepository.getPlayerPhase(this._playerId)
        return currentPlayerPhase === 'attack' && attacks.length < 2;
    }
}

module.exports = SmallCannon;

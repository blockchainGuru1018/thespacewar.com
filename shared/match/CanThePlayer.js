const Neutralization = require('../card/Neutralization.js');

class CanThePlayer {

    constructor({
        playerStateService,
        opponentStateService
    } = {}) {
        this._playerStateService = playerStateService;
        this._opponentStateService = opponentStateService;
    }

    useThisDurationCard(cardId) {
        return !this._playerStateService.hasDurationCardOfType(Neutralization.CommonId)
            && !this._opponentStateService.hasDurationCardOfType(Neutralization.CommonId);
    }

    moveThisCard(card) {
        if (card.type === 'missile') {
            return !this._opponentStateService
                .hasMatchingCardInSomeZone(card => card.preventsOpponentMissilesFromMoving);
        }
        return true;
    }

    attackWithThisCard(card) {
        if (card.type === 'missile') {
            return !this._opponentStateService
                .hasMatchingCardInSomeZone(card => card.preventsOpponentMissilesFromAttacking);
        }
        return true;
    }
}

module.exports = CanThePlayer;
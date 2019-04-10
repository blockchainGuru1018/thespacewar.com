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
        const cardData = this._findCardFromOpponentOrPlayer(cardId);
        if (cardData && cardData.commonId === Neutralization.CommonId) return true;

        let noPlayerHasNeutralizationInPlay = !this._playerStateService.hasDurationCardOfType(Neutralization.CommonId)
            && !this._opponentStateService.hasDurationCardOfType(Neutralization.CommonId);

        return noPlayerHasNeutralizationInPlay;
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

    _findCardFromOpponentOrPlayer(cardId) {
        return this._playerStateService.findCardFromAnySource(cardId)
            || this._opponentStateService.findCardFromAnySource(cardId);
    }
}

module.exports = CanThePlayer;
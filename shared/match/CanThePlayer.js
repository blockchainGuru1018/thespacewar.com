const Neutralization = require('../card/Neutralization.js');

//TODO Idea for interface. Each method takes cardData, but if necessary or ideal they have a
// sibling method with the same name and a suffix "byId" that get the cardData and runs the other method.
// In an ideal world it would only take real "behaviourCards", that is NOT cardData but an instance of BaseCard.
class CanThePlayer {

    constructor({
        playerStateService,
        opponentStateService
    } = {}) {
        this._playerStateService = playerStateService;
        this._opponentStateService = opponentStateService;
    }

    //TODO This could do as "putDownThisEventCard" and check for properties on instantiated cards instead of checking against static properties.
    useThisDurationCard(cardId) {
        const cardData = this._findCardFromOpponentOrPlayer(cardId);
        if (cardData && cardData.commonId === Neutralization.CommonId) return true;

        let noPlayerHasNeutralizationInPlay = !this._playerStateService.hasDurationCardOfType(Neutralization.CommonId)
            && !this._opponentStateService.hasDurationCardOfType(Neutralization.CommonId);

        return noPlayerHasNeutralizationInPlay;
    }

    putDownThisCard(cardData) {
        if (cardData.type === 'event') {
            return this.putDownThisEventCard(cardData.id);
        }

        return true;
    }

    putDownThisEventCard(cardData) {
        let somePlayerHasCardThatPreventsEventCards = this._playerStateService.hasMatchingCardInSomeZone(card => card.preventsAnyPlayerFromPlayingAnEventCard)
            || this._opponentStateService.hasMatchingCardInSomeZone(card => card.preventsAnyPlayerFromPlayingAnEventCard);

        return !somePlayerHasCardThatPreventsEventCards;
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
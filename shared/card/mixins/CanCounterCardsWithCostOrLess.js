module.exports = (canCounterCardsWithCostOrLess, superclass) => class extends superclass {

    canCounterCard(cardToCounter) {
        return cardToCounter.cost <= canCounterCardsWithCostOrLess
            && !this._queryEvents.playerCardWasInHandAfterOpponentCardWasPlayed(this, cardToCounter);
    }

    get canCounterCardsBeingPlayed() {
        return true;
    }
};

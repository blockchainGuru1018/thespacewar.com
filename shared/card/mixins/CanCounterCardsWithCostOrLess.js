module.exports = (canCounterCardsWithCostOrLess, superclass) => class extends superclass {

    canBePutDownAnyTime() {
        return this.type === 'event';
    }

    canCounterCard(cardToCounter) {
        return cardToCounter.cost <= canCounterCardsWithCostOrLess;
    }
};

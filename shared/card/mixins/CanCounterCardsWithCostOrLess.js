module.exports = (canCounterCardsWithCostOrLess, superclass) => class extends superclass {

    canBePutDownAnyTime() {
        return true;
    }

    canCounterCard(cardToCounter) {
        return cardToCounter.cost <= canCounterCardsWithCostOrLess;
    }
};

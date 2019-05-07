module.exports = (canCounterCardsWithCostOrLess, superclass) => class extends superclass {
    canCounterCard(cardToCounter) {
        return cardToCounter.cost <= canCounterCardsWithCostOrLess;
    }
};

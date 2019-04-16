const playerStateServiceFactory = {
    withStubs: (stubs = {}) => {
        return {
            getAttackBoostForCard: () => 0,
            cardCanMoveOnTurnWhenPutDown: () => false,
            hasMatchingCardInSameZone: () => false,
            getCardsInDeck: () => [],
            getDiscardedCards: () => [],
            putDownEventCardInZone() {},
            putDownCardInZone() {},
            removeCardFromDeck() {},
            ...stubs
        };
    }
};

module.exports = playerStateServiceFactory;
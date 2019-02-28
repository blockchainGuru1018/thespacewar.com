const playerStateServiceFactory = {
    withStubs: (stubs = {}) => {
        return {
            getAttackBoostForCard: () => 0,
            cardCanMoveOnTurnWhenPutDown: () => false,
            hasMatchingCardInSameZone: () => false,
            ...stubs
        };
    }
}

module.exports = playerStateServiceFactory;
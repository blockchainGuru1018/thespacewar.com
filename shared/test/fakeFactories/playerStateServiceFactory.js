const playerStateServiceFactory = {
    withStubs: (stubs = {}) => {
        return {
            getAttackBoostForCard: () => 0,
            cardCanMoveOnTurnWhenPutDown: () => false,
            ...stubs
        };
    }
}

module.exports = playerStateServiceFactory;
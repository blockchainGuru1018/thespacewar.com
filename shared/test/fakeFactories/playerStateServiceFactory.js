const playerStateServiceFactory = {
    withStubs: stubs => {
        return {
            getAttackBoostForCard: () => 0,
            ...stubs
        };
    }
}

module.exports = playerStateServiceFactory;
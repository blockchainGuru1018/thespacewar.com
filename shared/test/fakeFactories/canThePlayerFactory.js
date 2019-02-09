const canThePlayerFactory = {
    withStubs: (stubs = {}) => {
        return {
            moveThisCard: () => true,
            attackWithThisCard: () => true,
            ...stubs
        };
    }
};

module.exports = canThePlayerFactory;
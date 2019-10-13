const canThePlayerFactory = {
    withStubs: (stubs = {}) => {
        return {
            moveThisCard: () => true,
            attackWithThisCard: () => true,
            affordCard: () => true,
            ...stubs
        };
    }
};

module.exports = canThePlayerFactory;

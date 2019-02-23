const queryEventsFactory = {
    withStubs: (stubs = {}) => {
        return {
            hasMovedOnTurn: () => false,
            hasMovedOnPreviousTurn: () => false,
            getRepairsOnTurn: () => [],
            ...stubs
        };
    }
}

module.exports = queryEventsFactory;
const queryEventsFactory = {
    withStubs: (stubs = {}) => {
        return {
            hasMovedOnTurn: () => false,
            hasMovedOnPreviousTurn: () => false,
            getRepairsOnTurn: () => [],
            getAttacksOnTurn: () => [],
            ...stubs
        };
    }
}

module.exports = queryEventsFactory;
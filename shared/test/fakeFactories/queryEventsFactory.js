const queryEventsFactory = {
    withStubs: stubs => {
        return {
            hasMovedOnTurn: () => false,
            hasMovedOnPreviousTurn: () => false,
            ...stubs
        };
    }
}

module.exports = queryEventsFactory;
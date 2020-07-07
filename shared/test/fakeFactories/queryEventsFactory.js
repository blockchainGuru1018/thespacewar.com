const queryEventsFactory = {
    withStubs: (stubs = {}) => {
        return {
            hasMovedOnTurn: () => false,
            hasMovedOnPreviousTurn: () => false,
            getRepairsOnTurn: () => [],
            getAttacksOnTurn: () => [],
            playerCardWasInHandAfterOpponentCardWasPlayed: () => false,
            ...stubs,
        };
    },
};

module.exports = queryEventsFactory;

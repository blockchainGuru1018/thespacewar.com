const queryEventsFactory = {
  withStubs: (stubs = {}) => {
    return {
      hasMovedOnTurn: () => false,
      hasMovedOnPreviousTurn: () => false,
      getRepairsOnTurn: () => [],
      getAttacksOnTurn: () => [],
      playerCardWasInHandAfterOpponentCardWasPlayed: () => false,
      wasGrantedByFreeEventOnPreviousTurn: () => false,
      wasGrantedByFreeEventOnPreviousTurnAtOpponentZone: () => false,
      ...stubs,
    };
  },
};

module.exports = queryEventsFactory;

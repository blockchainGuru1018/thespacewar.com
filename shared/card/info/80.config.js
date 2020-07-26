const CommonId = "80";

module.exports = {
  CommonId,
  dormantEffectRequirementSpec: {
    forPlayer: [
      {
        cardCommonId: CommonId,
        type: "findCard",
        count: 2,
        sources: ["currentCardZone"],
        target: "discardPile",
        filter: {
          type: "spaceShip",
        },
        cancelable: false,
        ifAddedAddAlso: [
          {
            forPlayer: [
              {
                cardCommonId: CommonId,
                type: "findCard",
                count: 1,
                sources: ["deck"],
                target: "currentCardZone",
                filter: {
                  type: "spaceShip",
                },
                cancelable: false,
                dormantEffect: { destroyTriggerCard: true },
              },
            ],
            forOpponent: [],
          },
        ],
      },
    ],
    forOpponent: [],
  },
};

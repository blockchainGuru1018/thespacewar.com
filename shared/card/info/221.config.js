const CommonId = "221";
module.exports = {
  CommonId,
  requirementSpecsWhenPutDownInHomeZone: {
    forOpponent: [],
    forPlayer: [
      {
        type: "sacrifice",
        count: 3,
        sources: ["cardsInZone", "cardsInOpponentZone"],
        submitOnEverySelect: true,
        cancelable: false,
        common: true,
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
  },
};

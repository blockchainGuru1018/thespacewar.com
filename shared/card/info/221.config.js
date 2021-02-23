const CommonId = "221";
module.exports = {
  CommonId,
  requirementSpecsWhenPutDownInHomeZone: {
    forPlayer: [
      {
        type: "findCard",
        count: 3,
        cardCommonId: CommonId,
        sources: ["cardsInZone", "cardsInOpponentZone"],
        target: "discardPile",
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
                sources: [
                  "deck",
                  "discardPile",
                  "actionStationCards",
                  "drawStationCards",
                  "handSizeStationCards",
                  "hand",
                ],
                target: "homeZone",
                filter: {
                  type: "spaceShip",
                },
                cancelable: false,
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

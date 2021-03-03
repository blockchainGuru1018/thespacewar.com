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
                  commonId: ["228"],
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

const CommonId = "218";
const DrawCardsCount = 3;

module.exports = {
  CommonId,
  requirementSpecsWhenPutDownInHomeZone: {
      forOpponent: [],
      forPlayer: [
        {
          type: "drawCard",
          count: DrawCardsCount,
          cardCommonId: CommonId,
        },
        {
          type: "discardCard",
          count: 1,
          cardCommonId: CommonId,
        },
        {
          type: "findCard",
          count: 1,
          sources: ["hand"],
          target: "deckTop",
        },
      ],
    },
};

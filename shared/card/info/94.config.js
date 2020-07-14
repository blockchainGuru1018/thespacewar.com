const CommonId = "94";

module.exports = {
  CommonId,
  requirementSpecsWhenPutDownInHomeZone: {
    forOpponent: [
      {
        type: "findCard",
        count: 1,
        sources: ["cardsInZone", "cardsInOpponentZone"],
        target: "discardPile",
        submitOnEverySelect: true,
        cancelable: false,
      },
    ],
    forPlayer: [
      {
        type: "findCard",
        count: 1,
        sources: ["cardsInZone", "cardsInOpponentZone"],
        target: "discardPile",
        submitOnEverySelect: true,
        cancelable: false,
      },
    ],
  },
};

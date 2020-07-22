const CommonId = "94";

module.exports = {
  CommonId,
  requirementSpecsWhenPutDownInHomeZone: {
    forOpponent: [
      {
        type: "sacrifice",
        count: 1,
        sources: ["cardsInZone", "cardsInOpponentZone"],
        submitOnEverySelect: true,
        cancelable: false,
        common: true,
      },
    ],
    forPlayer: [
      {
        type: "sacrifice",
        count: 1,
        sources: ["cardsInZone", "cardsInOpponentZone"],
        submitOnEverySelect: true,
        cancelable: false,
        common: true,
      },
    ],
  },
};

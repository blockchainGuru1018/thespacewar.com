const CommonId = "219";
module.exports = {
  CommonId,
  requirementSpecsWhenPutDownInHomeZone: {
    forOpponent: [],
    forPlayer: [
      {
        type: "findCard",
        count: 2,
        sourceLimit: 10,
        sources: ["deckTop"],
        submitOnEverySelect: false,
        target: "hand",
        targetForRest: "deckBottom",
      },
    ],
  },
};

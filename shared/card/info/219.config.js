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
        sources: ["deck-top"],
        submitOnEverySelect: true,
        target: "hand",
        targetForRest: "deck-bottom",
        cancelable: false,
      },
    ],
  },
};

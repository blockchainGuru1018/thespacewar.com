const CommonId = "213";
module.exports = {
  CommonId,
  requirementSpecsWhenPutDownInHomeZone: {
    forOpponent: [],
    forPlayer: [
      {
        type: "findCard",
        count: 1,
        sources: ["discardPile"],
        target: "hand",
      },
    ],
  },
};

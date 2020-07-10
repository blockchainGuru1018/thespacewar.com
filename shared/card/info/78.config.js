const CommonId = "78";

module.exports = {
  CommonId,
  requirementSpecsWhenPutDownInHomeZone: {
    forOpponent: [],
    forPlayer: [{ type: "drawCard", count: 1, cardCommonId: CommonId }],
  },
};

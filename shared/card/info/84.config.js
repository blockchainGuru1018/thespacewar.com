const CommonId = "84";

module.exports = {
  CommonId,
  requirementSpecsWhenPutDownInHomeZone: {
    forOpponent: [],
    forPlayer: [{ type: "drawCard", cancelable: true, count: 1, cardCommonId: CommonId }],
  },
};

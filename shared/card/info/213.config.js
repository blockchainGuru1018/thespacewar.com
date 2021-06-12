const CommonId = "213";
module.exports = {
  CommonId,
  requirementSpecsWhenPutDownInHomeZone: {
    forOpponent: [],
    forPlayer: [
      {
        cardCommonId: CommonId,
        type: "damageSpaceship",
        count: 1,
        damage: 3,
        common: false,
        waiting: false,
      },
    ],
  },
};

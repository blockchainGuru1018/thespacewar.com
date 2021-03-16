const CommonId = "225";
module.exports = {
  CommonId,
  dormantEffectRequirementSpec: {
    forOpponent: [],
    forPlayer: [
      {
        type: "moveCardToStationZone",
        common: false,
        waiting: false,
        cardCommonId: CommonId,
      },
    ],
  },
};

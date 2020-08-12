const CommonId = "77";

module.exports = {
  CommonId,
  dormantEffectRequirementSpec: {
    forPlayer: [
      {
        type: "findCard",
        count: 3,
        sources: ["deck", "discardPile"],
        target: "currentCardZone",
        filter: {
          commonId: ["78"],
        },
      },
    ],
    forOpponent: [],
  },
};

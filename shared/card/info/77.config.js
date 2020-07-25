const CommonId = "77";

module.exports = {
  CommonId,
  dormantEffectRequirementSpec: {
    forPlayer: [
      {
        type: "findCard",
        count: 3,
        sources: [
          "deck",
          "discardPile",
          "actionStationCards",
          "drawStationCards",
          "handSizeStationCards",
          "hand",
        ],
        target: "currentCardZone",
        submitOnEverySelect: true,
        filter: {
          commonId: ["78"],
        },
      },
    ],
    forOpponent: [],
  },
};

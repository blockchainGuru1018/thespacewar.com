const CommonId = "77";

module.exports = {
  CommonId,
  requirementSpecsWhenPutDownInHomeZone: {
    forPlayer: [
      {
        type: "findCard",
        count: 2,
        sources: [
          "deck",
          "discardPile",
          "actionStationCards",
          "drawStationCards",
          "handSizeStationCards",
          "hand",
        ],
        target: "homeZone",
        filter: {
          commonId: ["78"],
        },
      },
    ],
  },
};

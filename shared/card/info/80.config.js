const CommonId = "80";

module.exports = {
  CommonId,
  dormantEffectRequirementSpec: {
    forPlayer: [
      {
        type: "findCard",
        count: 2,
        sources: ["currentCardZone"],
        target: "discardPile",
        filter: {
          type: "spaceShip",
        },
        whenResolvedAddAlso: {
          forPlayer: [
            {
              type: "findCard",
              count: 1,
              sources: ["deck"],
              target: "currentCardZone",
              filter: {
                type: "spaceShip",
              },
            },
          ],
          forOpponent: [],
        },
      },
    ],
    forOpponent: [],
  },
};

const CommonId = "86";
const DrawCardsCount = 2;

module.exports = {
  CommonId,
  choiceToRequirementSpec: {
    draw: {
      forOpponent: [],
      forPlayer: [
        {
          type: "drawCard",
          count: DrawCardsCount,
          cardCommonId: CommonId,
        },
      ],
    },
    destroy: {
      forOpponent: [],
      forPlayer: [
        {
          type: "findCard",
          count: 1,
          sources: ["opponentCardsInZone"],
          target: "opponentDiscardPile",
          filter: {
            type: "duration",
          },
        },
      ],
    },
  },
  choicesWhenPutDownInHomeZone: [
    {
      name: "destroy",
      text: "Destroy any duration card",
    },
    {
      name: "draw",
      text: `Draw ${DrawCardsCount} cards`,
    },
  ],
};

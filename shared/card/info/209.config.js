const CommonId = "209";
const DrawCardsCount = 1;

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
    counter: {
      forOpponent: [],
      forPlayer: [
        {
          type: "counterCard",
          count: 1,
          sources: ["opponentAny"],
          filter: {
            canBeCountered: true,
          },
        },
        {
          type: "drawCard",
          count: DrawCardsCount,
          cardCommonId: CommonId,
        },
        {
          type: "discardCard",
          count: 1,
          cardCommonId: CommonId,
        }
      ],
    },
  },
  choicesWhenPutDownInHomeZone: [
    {
      name: "counter",
      text: "Counter a card costing 0 or 1. You may draw a card and discard a card.",
    },
    {
      name: "draw",
      text: `Draw ${DrawCardsCount} cards`,
    },
  ],
};

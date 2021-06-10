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
    counter_and_draw: {
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
    counter_no_draw: {
      forOpponent: [],
      forPlayer: [
        {
          type: "counterCard",
          count: 1,
          sources: ["opponentAny"],
          filter: {
            canBeCountered: true,
          },
        }
      ],
    },
  },
  choicesWhenPutDownInHomeZone: [
    {
      name: "counter_and_draw",
      text: "Counter a card costing 0 or 1. Draw a card and discard a card.",
    },
    {
      name: "counter_no_draw",
      text: "Counter a card costing 0 or 1.",
    },
    {
      name: "draw",
      text: `Draw ${DrawCardsCount} cards`,
    },
  ],
};

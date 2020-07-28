const CardEffect = require("../match/CardEffect");
const BaseCard = require("../card/BaseCard");
const { createCard } = require("./testUtils/shared.js");

describe("Card Effect", () => {
  it("should increase the cost of all the card but not self", function () {
    const cardEffect = CardEffect({
      playerStateService: {
        getMatchingBehaviourCardsInBoard: (matcher) =>
          [{ allCardsCostIncrementEffect: 3 }].filter(matcher),
      },
      canThePlayer: {
        useThisDurationCard: () => true,
      },
    });

    const cardtoPutDown = createCard(BaseCard, {
      card: { id: "C1A", cost: 1 },
      cardEffect,
    });

    expect(cardEffect.costCardIncrement()).toBe(3);
    expect(cardtoPutDown.baseCost).toBe(1);
    expect(cardtoPutDown.costWithInflation).toBe(4);
  });
});

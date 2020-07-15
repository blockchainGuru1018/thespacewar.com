const Carrier = require("../card/Carrier.js");
const Avoid = require("../card/Avoid.js");
const { createCard } = require("./testUtils/shared.js");

describe("Can use dormant effect of Carrier", () => {
  it("when current turn its next turn carrier was putted down", () => {
    const card = new createCard(Carrier, {
      queryBoard: {
        opponentHasCardInPlay: (matcher) =>
          matcher({ commonId: Avoid.CommonId }),
      },
      queryEvents: {
        getTurnWhenCardDormantEffectWasUsed: () => null,
        getTurnWhenCardWasPutDown: () => 1,
      },
      matchService: {
        getTurn: () => 2,
      },
    });
    expect(card.canTriggerDormantEffect()).toBeTruthy();
  });
});

describe("Cannot use dormant effect of Carrier", () => {
  it("when current turn its  turn when carrier was putted down", () => {
    const card = new createCard(Carrier, {
      queryBoard: {
        opponentHasCardInPlay: (matcher) =>
          matcher({ commonId: Avoid.CommonId }),
      },
      queryEvents: {
        getTurnWhenCardDormantEffectWasUsed: () => null,
        getTurnWhenCardWasPutDown: () => 1,
      },
      matchService: {
        getTurn: () => 1,
      },
    });
    expect(card.canTriggerDormantEffect()).toBeFalsy();
  });

  it("when dormant effect was already used on current turn", () => {
    const card = new createCard(Carrier, {
      queryBoard: {
        opponentHasCardInPlay: (matcher) =>
          matcher({ commonId: Avoid.CommonId }),
      },
      queryEvents: {
        getTurnWhenCardDormantEffectWasUsed: () => 2,
        getTurnWhenCardWasPutDown: () => 1,
      },
      matchService: {
        getTurn: () => 2,
      },
    });
    expect(card.canTriggerDormantEffect()).toBeFalsy();
  });
});

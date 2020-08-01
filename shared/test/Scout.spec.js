const Scout = require("../card/Scout.js");
const { createCard } = require("./testUtils/shared.js");
const { PHASES } = require("../phases");
describe("Can use dormant effect", () => {
  it("when have not attacked ", () => {
    const card = new createCard(Scout, {
      queryEvents: {
        getTurnWhenCardDormantEffectWasUsed: () => null,
        getAttacksOnTurn: () => [],
      },
      matchService: {
        getTurn: () => 1,
      },
      playerStateService: {
        getPhase: () => PHASES.attack,
      },
    });
    expect(card.canTriggerDormantEffect()).toBe(true);
  });
});

describe("Can not use dormant effect", () => {
  it("when have already used dormant effect", () => {
    const card = new createCard(Scout, {
      queryEvents: {
        getTurnWhenCardDormantEffectWasUsed: () => 2,
        getAttacksOnTurn: () => [],
      },
      matchService: {
        getTurn: () => 2,
      },
      playerStateService: {
        getPhase: () => PHASES.attack,
      },
    });
    expect(card.canTriggerDormantEffect()).toBe(false);
  });

  it("when have already attacked", () => {
    const card = new createCard(Scout, {
      queryEvents: {
        getTurnWhenCardDormantEffectWasUsed: () => 1,
        getAttacksOnTurn: () => [1],
      },
      matchService: {
        getTurn: () => 2,
      },
      playerStateService: {
        getPhase: () => PHASES.attack,
      },
    });
    expect(card.canTriggerDormantEffect()).toBe(false);
  });
});

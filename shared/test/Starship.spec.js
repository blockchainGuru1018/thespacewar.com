const Starship = require("../card/Starship.js");
const { createCard } = require("./testUtils/shared.js");
const { PHASES } = require("../phases.js");

describe("Starship", () => {
  it("should cost 1 less for each spaceship in play", () => {
    const CARDS_IN_PLAY = 5;
    const card = new createCard(Starship, {
      card: { cost: 10 },
      playerStateService: {
        getCardsInPlay: () => new Array(CARDS_IN_PLAY),
        getPhase: () => PHASES.action,
      },
    });
    expect(card.costToPlay).toBe(card.baseCost - CARDS_IN_PLAY);
  });

  it("cost to play should not be negative number", () => {
    const CARDS_IN_PLAY = 11;
    const card = new createCard(Starship, {
      card: { cost: 10 },
      playerStateService: {
        getCardsInPlay: () => new Array(CARDS_IN_PLAY),
        getPhase: () => PHASES.action,
      },
    });
    expect(card.costToPlay).toBe(0);
  });
});

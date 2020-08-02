const Drone = require("../card/Drone");
const { createCard } = require("./testUtils/shared.js");
const Commander = require("../../shared/match/commander/Commander.js");

describe("Drone ", () => {
  it("should have a 1 attack boost when playing with Crakux", () => {
    const card = new createCard(Drone, {
      card: { attack: 1 },
      playerStateService: {
        getCurrentCommander: () => Commander.Crakux,
      },
    });
    expect(card.attack).toBe(2);
  });
  it("should have a +1 attack boost from Crakux and +3 from Collision skill", () => {
    const card = new createCard(Drone, {
      card: {
        attack: 1,
      },
      cardEffect: {
        attackBoostForCollision: () => 3,
        attackBoostForCardType: () => 0,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.Crakux,
      },
    });
    expect(card.attack).toBe(5);
  });
});

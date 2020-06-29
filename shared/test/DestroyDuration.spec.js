const DestroyDuration = require("../card/DestroyDuration.js");

describe("Destroy Duration", () => {
  it("can target duration card for sacrifice", () => {
    const card = new DestroyDuration({
      playerId: "P1A",
    });
    const otherCard = {
      type: "duration",
      playerId: "P2A",
    };
    expect(card.canTargetCardForSacrifice(otherCard)).toBe(true);
  });
  
  it("can NOT target space ship for sacrifice", () => {
    const card = new DestroyDuration({
      playerId: "P1A",
    });
    const spaceshipCard = {
      type: "spaceShip",
      playerId: "P2A",
    };
    expect(card.canTargetCardForSacrifice(spaceshipCard)).toBe(false);
  });

  it("Should not be able to target own cards", () => {
    const card = new DestroyDuration({
      playerId: "P1A",
    });
    const durationCard = {
      type: "duration",
      playerId: "P1A",
    };
    expect(card.canTargetCardForSacrifice(durationCard)).toBe(false);
  });
});

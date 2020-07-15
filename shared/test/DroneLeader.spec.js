const DroneLeader = require("../card/DroneLeader.js");
const Drone = require("../card/Drone.js");
const { createCard } = require("./testUtils/shared.js");

describe("Drone Leader damage", () => {
  it("should calculate the damage by the amount of drone in play", () => {
    const card = new createCard(DroneLeader, {
      playerStateService: {
        getMatchingBehaviourCards: () => [
          { id: "C1A", commonId: Drone.CommonId },
          { id: "C2A", commonId: Drone.CommonId },
        ],
      },
    });
    expect(card.attack).toBe(2);
  });
  it("Damage should be 0 when none Drones in play", () => {
    const card = new createCard(DroneLeader, {
      playerStateService: {
        getMatchingBehaviourCards: () => [],
      },
    });
    expect(card.attack).toBe(0);
  });
});

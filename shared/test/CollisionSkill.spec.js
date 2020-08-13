const CardEffect = require("../match/CardEffect");
const BaseCard = require("../card/BaseCard");
const CollisionSkill = require("../card/CollisionSkill.js");
const { createCard } = require("./testUtils/shared.js");

describe("Collision Skill", () => {
  it("should increase the damage of all the card if using the collide option", function () {
    const cardEffect = CardEffect({
      playerStateService: {
        getDurationBehaviourCards: () => [createCard(CollisionSkill)],
      },
      canThePlayer: {
        useThisDurationCard: () => true,
      },
    });

    const cardtoPutDown = createCard(BaseCard, {
      card: { id: "C1A", attack: 1, type: "spaceShip", usingCollision: true },
      cardEffect,
    });
    expect(cardtoPutDown.attack).toBe(3);
    expect(cardEffect.canCollideForDurationCard()).toBe(true);
  });
});

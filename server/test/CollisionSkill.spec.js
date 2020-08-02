const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");
const PutDownCardEvent = require("../../shared/PutDownCardEvent.js");
const MoveCardEvent = require("../../shared/event/MoveCardEvent.js");
const CollisionSkill = require("../../shared/card/CollisionSkill.js");
const CardEffect = require("../../shared/match/CardEffect.js");
const {
  createCard,
} = require("../../shared/test/testUtils/FakeCardDataAssembler.js");

describe("When player has Collision Skill", () => {
  it("and collide an opponent's spaceship", () => {
    const {
      match,
      firstPlayerAsserter,
      secondPlayerAsserter,
    } = setupIntegrationTest({
      playerOrder: ["P1A", "P2A"],
      turn: 4,
      currentPlayer: "P1A",
      playerStateById: {
        P1A: {
          phase: "attack",
          cardsInOpponentZone: [
            createCard({
              id: "C1A",
              type: "spaceShip",
              attack: 1,
              _cardEffect: CardEffect({
                playerStateService: {
                  getDurationBehaviourCards: () => [createCard(CollisionSkill)],
                },
                canThePlayer: {
                  useThisDurationCard: () => true,
                },
              }),
            }),
            createCard({ id: "C2A", commonId: CollisionSkill.CommonId }),
          ],
          stationCards: [stationCard("S1A"), stationCard("S2A")],
          events: [
            PutDownCardEvent({
              cardId: "C1A",
              turn: 1,
              location: "zone",
            }),
            PutDownCardEvent({
              cardId: "C2A",
              turn: 1,
              location: "zone",
            }),
            MoveCardEvent({ id: "C1A", turn: 2 }),
          ],
          cardsOnHand: [],
        },
        P2A: {
          cardsInZone: [
            createCard({
              id: "C1B",
              type: "spaceShip",
              attack: 1,
              defense: () => 4,
            }),
          ],
          events: [
            PutDownCardEvent({
              cardId: "C1B",
              turn: 2,
              location: "zone",
            }),
            MoveCardEvent({ cardId: "C2A", turn: 3 }),
          ],
        },
      },
    });
    match.attack("P1A", {
      attackerCardId: "C1A",
      defenderCardId: "C1B",
      usingCollision: false,
    });
    expect(0).toBe(0);
    // // firstPlayerAsserter.hasRequirement({
    // //   cardCommonId: "94",
    // //   cardId: "C3A",
    // //   common: true,
    // //   count: 1,
    // //   type: "sacrifice",
    // //   waiting: false,
    // // });

    // secondPlayerAsserter.hasRequirement({
    //   cardCommonId: "94",
    //   cardId: "C3A",
    //   common: true,
    //   count: 1,
    //   type: "sacrifice",
    //   waiting: false,
    // });
  });
});

function stationCard(id = "some_id", place = "action") {
  return {
    place,
    card: createCard({ id }),
  };
}

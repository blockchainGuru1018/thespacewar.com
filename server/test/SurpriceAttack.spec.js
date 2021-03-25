const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");
const PutDownCardEvent = require("../../shared/PutDownCardEvent.js");
const MoveCardEvent = require("../../shared/event/MoveCardEvent.js");
const SurpriseAttack = require("../../shared/card/SurpriseAttack.js");
const {
  createCard,
} = require("../../shared/test/testUtils/FakeCardDataAssembler.js");

describe("Playing SurpriseAttack", () => {
  let _match, _firstPlayerAsserter, _secondPlayerAsserter;

  beforeAll(() => {
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
          phase: "action",

          stationCards: [stationCard("S1A"), stationCard("S2A")],
          events: [],
          cardsOnHand: [
            createCard({ id: "C3A", commonId: SurpriseAttack.CommonId }),
          ],
        },
        P2A: {
          cardsInZone: [
            createCard({ id: "C2A", type: "spaceShip", attack: 1, defense: 5 }),
          ],
          events: [
            PutDownCardEvent({
              cardId: "C2A",
              turn: 2,
              location: "zone",
            }),
          ],
        },
      },
    });
    _match = match;
    _secondPlayerAsserter = secondPlayerAsserter;
    _firstPlayerAsserter = firstPlayerAsserter;

    match.putDownCard("P1A", {
      location: "zone",
      cardId: "C3A",
    });
  });
  test("Should have 'damageSpaceship' requirement", () => {
    _firstPlayerAsserter.hasRequirement({
      cardCommonId: "213",
      common: false,
      damage: 3,
      count: 1,
      type: "damageSpaceship",
      waiting: false,
    });
  });

  test("Selecting enemy spaceShip should do 3 damage", () => {
    _match.damageSpaceship("P1A", { cardId: "C2A" });
    _secondPlayerAsserter.hasCardWithDamageAtHomeZone("C2A", 3);
  });
});

function stationCard(id = "some_id", place = "action") {
  return {
    place,
    card: createCard({ id }),
  };
}

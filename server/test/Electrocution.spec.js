const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const Electrocution = require("../../shared/card/Electrocution.js");
const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");

describe("When playing Electrocution should", () => {
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
          cardsOnHand: [
            createCard({ id: "C1A", commonId: Electrocution.CommonId }),
          ],
          cardsInZone: [
            createCard({ id: "C2A", type: "spaceShip" }),
            createCard({ id: "C3A", type: "defense" }),
            createCard({ id: "C4A", type: "missile" }),
          ],
          actionStationCards: 5,
        },
        P2A: {
          cardsInZone: [
            createCard({ id: "C1B", type: "spaceShip" }),
            createCard({ id: "C2B", type: "defense" }),
            createCard({ id: "C3B", type: "missile" }),
          ],
        },
      },
    });

    _match = match;
    _firstPlayerAsserter = firstPlayerAsserter;
    _secondPlayerAsserter = secondPlayerAsserter;

    _match.putDownCard("P1A", {
      location: "zone",
      cardId: "C1A",
    });
  });

  it("All space ships should be paralyzed", () => {
    _firstPlayerAsserter.hasParalyzedCardAtHomeZone("C2A");
    _secondPlayerAsserter.hasParalyzedCardAtHomeZone("C1B");
  });

  it("All shield should be destroyed", () => {
    _firstPlayerAsserter.hasDiscardedCard("C3A");
    _secondPlayerAsserter.hasDiscardedCard("C2B");
  });

  it("All missiles should be destroyed", () => {
    _firstPlayerAsserter.hasDiscardedCard("C4A");
    _secondPlayerAsserter.hasDiscardedCard("C3B");
  });
});

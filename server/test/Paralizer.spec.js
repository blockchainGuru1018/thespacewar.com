const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const TheParalyzer = require("../../shared/card/TheParalyzer.js");
const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");

describe("When attacking a card with paralizer", () => {
  let _match, _secondPlayerAsserter;

  beforeAll(() => {
    const { match, secondPlayerAsserter } = setupIntegrationTest({
      playerOrder: ["P1A", "P2A"],
      turn: 4,
      currentPlayer: "P1A",
      playerStateById: {
        P1A: {
          phase: "attack",

          cardsInOpponentZone: [
            createCard({
              id: "C1A",
              attack: 1,
              commonId: TheParalyzer.CommonId,
            }),
          ],
          actionStationCards: 5,
        },
        P2A: {
          cardsInZone: [
            createCard({ id: "C1B", defense: 3, type: "spaceShip" }),
          ],
        },
      },
    });

    _match = match;
    _secondPlayerAsserter = secondPlayerAsserter;

    _match.attack("P1A", {
      attackerCardId: "C1A",
      defenderCardId: "C1B",
      usingCollision: false,
    });
  });

  it("target card should be paralized", () => {
    _secondPlayerAsserter.hasParalyzedCardAtHomeZone("C1B");
  });
});

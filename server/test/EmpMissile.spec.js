const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const TheParalyzer = require("../../shared/card/TheParalyzer.js");
const EmpMissile = require("../../shared/card/EmpMissile.js");
const EnergyShield = require("../../shared/card/EnergyShield.js");
const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");
const PutDownCardEvent = require("../../shared/PutDownCardEvent");

describe("Emp missile attack spaceship", () => {
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
          phase: "attack",
          cardsOnHand: [],
          events: [PutDownCardEvent.forTest({ turn: 1, cardId: "C2A" })],
          cardsInZone: [
            createCard({
              id: "C2A",
              type: "missile",
              commonId: EmpMissile.CommonId,
            }),
          ],
          actionStationCards: 5,
        },
        P2A: {
          cardsInZone: [
            createCard({
              id: "C1B",
              commonId: TheParalyzer.CommonId,
              type: "spaceShip",
            }),
          ],
        },
      },
    });

    _match = match;
    _firstPlayerAsserter = firstPlayerAsserter;
    _secondPlayerAsserter = secondPlayerAsserter;

    _match.attack("P1A", {
      attackerCardId: "C2A",
      defenderCardId: "C1B",
    });
  });

  it("emp missile should be discarted", () => {
    _firstPlayerAsserter.hasDiscardedCard("C2A");
  });

  it("Target card should be paralized", () => {
    _secondPlayerAsserter.hasParalyzedCardAtHomeZone("C1B");
  });
});

describe("Emp missile attack shield", () => {
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
          phase: "attack",
          cardsOnHand: [],
          events: [PutDownCardEvent.forTest({ turn: 1, cardId: "C2A" })],
          cardsInZone: [
            createCard({
              id: "C2A",
              type: "missile",
              commonId: EmpMissile.CommonId,
            }),
          ],
          actionStationCards: 5,
        },
        P2A: {
          cardsInZone: [
            createCard({
              id: "C1B",
              commonId: EnergyShield.CommonId,
              type: "spaceShip",
            }),
          ],
        },
      },
    });

    _match = match;
    _firstPlayerAsserter = firstPlayerAsserter;
    _secondPlayerAsserter = secondPlayerAsserter;

    _match.attack("P1A", {
      attackerCardId: "C2A",
      defenderCardId: "C1B",
    });
  });

  it("emp missile should be discarted", () => {
    _firstPlayerAsserter.hasDiscardedCard("C2A");
  });

  it("Target card should be paralized", () => {
    _secondPlayerAsserter.hasDiscardedCard("C1B");
  });
});

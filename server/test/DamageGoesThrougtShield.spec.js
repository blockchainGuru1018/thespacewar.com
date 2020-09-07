const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const Shield = require("../../shared/card/Shield.js");
const NuclearMissile = require("../../shared/card/NuclearMissile.js");
const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");

describe("Damage goes throught shield", () => {
  let _match, _secondPlayerAsserter;

  beforeAll(() => {
    const { match, secondPlayerAsserter } = setupIntegrationTest({
      playerOrder: ["P1A", "P2A"],
      turn: 4,
      currentPlayer: "P1A",
      playerStateById: {
        P1A: {
          phase: "attack",
          events: [
            {
              type: "putDownCard",
              cardId: "C4A",
              location: "zone",
              turn: 2,
              grantedForFreeByEvent: false,
            },
            {
              type: "moveCard",
              cardId: "C4A",
              turn: 2,
            },
          ],
          cardsInOpponentZone: [
            createCard({
              id: "C4A",
              attack: 3,
              commonId: NuclearMissile.CommonId,
            }),
          ],
          actionStationCards: 5,
        },
        P2A: {
          cardsInZone: [
            createCard({ id: "C1B", type: "spaceShip" }),
            createCard({
              id: "C3A",
              defense: 2,
              commonId: Shield.CommonId,
            }),
            createCard({ id: "C3B", type: "missile" }),
          ],
          stationCards: [
            stationCard("S1A", "action"),
            stationCard("S2B", "action"),
          ],
        },
      },
    });
    _match = match;
    _secondPlayerAsserter = secondPlayerAsserter;

    _match.attackStationCard("P1A", {
      attackerCardId: "C4A",
      targetStationCardIds: ["S1A"],
    });
  });

  it("Shield should be discarded", () => {
    _secondPlayerAsserter.send("P2A");
    _secondPlayerAsserter.hasDiscardedCard("C3A");
  });
  it("station card should be flipped", () => {
    _secondPlayerAsserter.hasFlippedStationCard("S1A");
  });
});

describe("When Damage goes thought and shield is damaged", () => {
  let _match, _secondPlayerAsserter;

  beforeAll(() => {
    const { match, secondPlayerAsserter } = setupIntegrationTest({
      playerOrder: ["P1A", "P2A"],
      turn: 4,
      currentPlayer: "P1A",
      playerStateById: {
        P1A: {
          phase: "attack",
          events: [
            {
              type: "putDownCard",
              cardId: "C4A",
              location: "zone",
              turn: 2,
              grantedForFreeByEvent: false,
            },
            {
              type: "moveCard",
              cardId: "C4A",
              turn: 2,
            },
          ],
          cardsInOpponentZone: [
            createCard({
              id: "C4A",
              attack: 3,
              commonId: NuclearMissile.CommonId,
            }),
          ],
          actionStationCards: 5,
        },
        P2A: {
          cardsInZone: [
            createCard({ id: "C1B", type: "spaceShip" }),
            createCard({
              id: "C3A",
              defense: 2,
              commonId: Shield.CommonId,
              damage: 1,
            }),
            createCard({ id: "C3B", type: "missile" }),
          ],
          stationCards: [
            stationCard("S1A", "action"),
            stationCard("S2B", "action"),
            stationCard("S3B", "action"),
          ],
        },
      },
    });
    _match = match;
    _secondPlayerAsserter = secondPlayerAsserter;

    _match.attackStationCard("P1A", {
      attackerCardId: "C4A",
      targetStationCardIds: ["S1A", "S2B"],
    });
  });

  it("Shield should be discarded", () => {
    _secondPlayerAsserter.send("P2A");
    _secondPlayerAsserter.hasDiscardedCard("C3A");
  });
  it("station card should be flipped", () => {
    _secondPlayerAsserter.hasFlippedStationCard("S1A");
    _secondPlayerAsserter.hasFlippedStationCard("S2B");
  });
});

function stationCard(id = "some_id", place = "action") {
  return {
    place,
    card: createCard({ id }),
  };
}

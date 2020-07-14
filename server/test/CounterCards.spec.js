const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");
const FatalError = require("../../shared/card/FatalError.js");
const Luck = require("../../shared/card/Luck.js");
const {
  createCard,
} = require("../../shared/test/testUtils/FakeCardDataAssembler.js");

describe("when opponent use Fatal Error to destroy a card", () => {
  it(" with cost higher than 2 and player counters that with Luck and has NOTHING to counter", () => {
    const { match, secondPlayerAsserter } = setupIntegrationTest({
      playerOrder: ["P1A", "P2A"],
      turn: 3,
      currentPlayer: "P1A",
      playerStateById: {
        P1A: {
          phase: "action",
          cardsOnHand: [
            createCard({ id: "C1A", commonId: FatalError.CommonId }),
          ],
          stationCards: [stationCard("S1A"), stationCard("S2A")],
        },
        P2A: {
          cardsOnHand: [
            createCard({
              id: "C3A",
              commonId: Luck.CommonId,
              type: "event",
            }),
          ],
          cardsInZone: [createCard({ id: "C2A", cost: 4 })],
        },
      },
    });

    match.putDownCard("P1A", {
      location: "zone",
      cardId: "C1A",
      choice: "C2A",
    });
    match.toggleControlOfTurn("P2A");
    match.putDownCard("P2A", {
      location: "zone",
      cardId: "C3A",
      choice: "counter",
    });
    secondPlayerAsserter.hasRequirement({
      cardCommonId: "31",
      cardGroups: [],
      cardId: "C3A",
      count: 0,
      type: "counterCard",
    });
  });
  it(" with cost equal 2 and player counters that with Luck and CAN be counter", () => {
    const { match, secondPlayerAsserter } = setupIntegrationTest({
      playerOrder: ["P1A", "P2A"],
      turn: 3,
      currentPlayer: "P1A",
      playerStateById: {
        P1A: {
          phase: "action",
          cardsOnHand: [
            createCard({ id: "C1A", commonId: FatalError.CommonId }),
          ],
          stationCards: [stationCard("S1A"), stationCard("S2A")],
        },
        P2A: {
          cardsOnHand: [
            createCard({
              id: "C3A",
              commonId: Luck.CommonId,
              type: "event",
            }),
          ],
          cardsInZone: [createCard({ id: "C2A", cost: 2 })],
        },
      },
    });

    match.putDownCard("P1A", {
      location: "zone",
      cardId: "C1A",
      choice: "C2A",
    });
    match.toggleControlOfTurn("P2A");
    match.putDownCard("P2A", {
      location: "zone",
      cardId: "C3A",
      choice: "counter",
    });
    secondPlayerAsserter.hasRequirement({
      cardCommonId: "31",
      cardGroups: [
        {
          cards: [{ commonId: "38", cost: 2, id: "C1A" }],
          source: "opponentAny",
        },
      ],
      cardId: "C3A",
      count: 1,
      type: "counterCard",
    });
  });

  function stationCard(id = "some_id", place = "action") {
    return {
      place,
      card: createCard({ id }),
    };
  }
});

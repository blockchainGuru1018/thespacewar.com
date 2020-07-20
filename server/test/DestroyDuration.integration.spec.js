const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const DestroyDuration = require("../../shared/card/DestroyDuration.js");
const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");

const DestroyDurationCommonId = DestroyDuration.CommonId;

describe("Destroy Duration Card", () => {
  it("When select draw should have requirements for drawing 2 cards", () => {
    const { match, firstPlayerAsserter } = setupIntegrationTest({
      turn: 2,
      playerStateById: {
        P1A: {
          phase: "action",
          cardsInDeck: [createCard({ id: "C2A" }), createCard({ id: "C3A" })],
          cardsOnHand: [
            createCard({
              commonId: DestroyDurationCommonId,
              id: "C1A",
            }),
          ],
        },
        P2A: {
          cardsInZone: [createCard({ id: "C2A", type: "duration" })],
        },
      },
    });
    match.putDownCard("P1A", {
      location: "zone",
      cardId: "C1A",
      choice: "draw",
    });

    firstPlayerAsserter.hasRequirement({
      cardCommonId: DestroyDurationCommonId,
      count: 2,
      type: "drawCard",
    });
  });

  it("When select destroy should have requirements find 1 card in the opponent cards in play", () => {
    const { match, firstPlayerAsserter } = setupIntegrationTest({
      turn: 2,
      playerStateById: {
        P1A: {
          phase: "action",
          cardsInDeck: [createCard({ id: "C2A" }), createCard({ id: "C3A" })],
          cardsOnHand: [
            createCard({
              commonId: DestroyDurationCommonId,
              id: "C1A",
            }),
          ],
        },
        P2A: {
          cardsInZone: [createCard({ id: "C2A", type: "duration" })],
        },
      },
    });
    match.putDownCard("P1A", {
      location: "zone",
      cardId: "C1A",
      choice: "destroy",
    });

    firstPlayerAsserter.hasRequirement({
      cancelable: false,
      cardCommonId: "86",
      cardGroups: [
        {
          cards: [{ cost: 0, id: "C2A", type: "duration" }],
          source: "opponentCardsInZone",
        },
      ],
      cardId: "C1A",
      common: false,
      count: 1,
      submitOnEverySelect: false,
      target: "opponentDiscardPile",
      type: "findCard",
      waiting: false,
    });
  });
});

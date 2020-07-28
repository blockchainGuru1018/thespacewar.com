const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");
const {
  createCard,
} = require("../../shared/test/testUtils/FakeCardDataAssembler.js");

test("when play a card should reduce action points by it's cost", () => {
  const { match } = setupIntegrationTest({
    playerOrder: ["P1A", "P2A"],
    turn: 1,
    currentPlayer: "P1A",
    playerStateById: {
      P1A: {
        phase: "action",
        stationCards: [
          {
            place: "action",
            card: createCard({ id: "S1A" }),
          },
        ],
        cardsOnHand: [createCard({ id: "C1A", cost: 1 })],
      },
    },
  });

  match.putDownCard("P1A", { location: "zone", cardId: "C1A" });

  const actionPoints = match._actionPointForPlayer("P1A");
  expect(actionPoints).toBe(1);
});

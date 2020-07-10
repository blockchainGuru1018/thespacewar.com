const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const DestroyDuration = require("../../shared/card/DestroyDuration.js");
const PutDownCardEvent = require("../../shared/PutDownCardEvent.js");
const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");

const DestroyDurationCommonId = DestroyDuration.CommonId;

const SameCostAsFatalError = 0; //Can be whatever, just has to be consistent in test

describe("Destroy Duration Card", () => {
  it("Should be able to sacrifice after first turn and if have not attacked yet", () => {
    const {
      match,
      secondPlayerAsserter,
      firstPlayerAsserter,
    } = setupIntegrationTest({
      turn: 2,
      playerStateById: {
        P1A: {
          phase: "attack",
          events: [
            PutDownCardEvent.forTest({
              turn: 1,
              location: "zone",
              cardId: "C1A",
            }),
          ],
          cardsInZone: [
            createCard({
              commonId: DestroyDurationCommonId,
              id: "C1A",
              type: "spaceShip",
            }),
          ],
        },
        P2A: {
          cardsInZone: [createCard({ id: "C2A", type: "duration" })],
        },
      },
    });

    match.sacrifice("P1A", { cardId: "C1A", targetCardId: "C2A" });

    secondPlayerAsserter.hasDiscardedCard("C2A");
    firstPlayerAsserter.hasDiscardedCard("C1A");
  });

  it("Should not be able to sacrifice on first turn", () => {
    const { match } = setupIntegrationTest({
      turn: 1,
      playerStateById: {
        P1A: {
          phase: "attack",
          events: [
            PutDownCardEvent.forTest({
              turn: 1,
              location: "zone",
              cardId: "C1A",
            }),
          ],
          cardsInZone: [
            createCard({ id: "C1A", commonId: DestroyDurationCommonId }),
          ],
        },
        P2A: {
          cardsInZone: [createCard({ id: "C2A", type: "duration" })],
        },
      },
    });

    const error = catchError(() =>
      match.sacrifice("P1A", { cardId: "C1A", targetCardId: "C2A" })
    );

    expect(error).toBeTruthy();
    expect(error.message).toBe("Cannot sacrifice");
  });
});

function catchError(callback) {
  try {
    callback();
  } catch (error) {
    return error;
  }
}

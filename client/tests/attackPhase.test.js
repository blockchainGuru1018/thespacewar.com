const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const PutDownCardEvent = require("../../shared/PutDownCardEvent.js");
const getCardImageUrl = require("../utils/getCardImageUrl.js");
const FakeState = require("../testUtils/FakeState.js");
const { createController } = require("../testUtils");
const {
  assert,
  sinon,
  timeout,
  dom: { click },
} = require("../testUtils/bocha-jest/bocha-jest.js");

let controller;

beforeEach(() => {
  sinon.stub(getCardImageUrl, "byCommonId").returns("/#");
  controller = createController();
});

afterEach(() => {
  getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();
  controller && controller.tearDown();
});

describe("attack phase", () => {
  it("should not see end turn modal confirmation when cards in zone have not posible actions", async () => {
    const { dispatch, showPage } = controller;
    showPage();
    dispatch(
      "stateChanged",
      FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "attack",
        events: [
          PutDownCardEvent({
            turn: 1,
            location: "zone",
            cardId: "C1A",
            cardCommonId: "86",
          }),
        ],
        cardsInZone: [createCard({ id: "C1A" })],
        stationCards: [{ place: "draw" }],
      })
    );

    await timeout();

    await click(".nextPhaseButton-endTurn");
    assert.elementCount(".confirmDialogHeader", 0);
  });

  it("should  see end turn modal confirmation when cards in zone still can perform actions", async () => {
    const { dispatch, showPage } = controller;
    showPage();
    dispatch(
      "stateChanged",
      FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "attack",
        events: [
          PutDownCardEvent({
            turn: 2,
            location: "zone",
            cardId: "C1A",
            cardCommonId: "86",
          }),
        ],
        cardsInZone: [createCard({ id: "C1A" })],
        stationCards: [{ place: "draw" }],
      })
    );

    await timeout();

    await click(".nextPhaseButton-endTurn");
    assert.elementCount(".confirmDialogHeader", 1);
    assert.elementText(
      ".confirmDialogContent",
      `You have a spaceship or missile that has not moved and/or attacked. Are you sure you want to end your turn?`
    );
  });
});

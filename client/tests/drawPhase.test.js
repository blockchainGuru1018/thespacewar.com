const getCardImageUrl = require("../utils/getCardImageUrl.js");
const FakeState = require("../testUtils/FakeState.js");
const FakeMatchController = require("../testUtils/FakeMatchController.js");
const { createController } = require("../testUtils");
const {
  assert,
  refute,
  timeout,
  stub,
  dom: { click },
} = require("../testUtils/bocha-jest/bocha-jest.js");
const DrawCardEvent = require("../../shared/event/DrawCardEvent.js");

let controller;
let matchController;

function setUpController(optionsAndPageDeps = {}) {
  //Has side effects to afford a convenient tear down
  matchController = FakeMatchController();
  controller = createController({ matchController, ...optionsAndPageDeps });

  return controller;
}

beforeEach(() => {
  getCardImageUrl.byCommonId = (commonId) => `/${commonId}`;
});

afterEach(() => {
  controller && controller.tearDown();
  matchController = null;
  controller = null;
});

describe("when in draw phase and can draw 2 cards per turn and has drawn 1 card already", () => {
  beforeEach(async () => {
    const { dispatch, showPage } = setUpController();
    showPage();
    dispatch(
      "stateChanged",
      FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "draw",
        stationCards: [stationCard("S1A", "draw"), stationCard("S2A", "draw")],
        events: [DrawCardEvent({ type: "drawCard", turn: 1 })],
      })
    );
    await timeout();
  });

  test("should show that there is 1 card left to draw", async () => {
    assert.elementTextStartsWith(".guideText-drawPhaseSubText", "Draw 1 card");
  });

  test("should NOT show skip button", () => {
    assert.elementCount(".skipDrawCard", 0);
  });
});

function stationCard(id, place) {
  return {
    id,
    place,
    card: { id },
  };
}

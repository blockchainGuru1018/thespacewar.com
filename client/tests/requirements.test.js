const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
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
const FatalError = require("../../shared/card/FatalError.js");

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

describe("when has damageStationCard requirement by emptyDeck and is waiting", () => {
  beforeEach(async () => {
    const { dispatch, showPage } = setUpController();
    showPage();
    dispatch(
      "stateChanged",
      FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "action",
        requirements: [
          {
            type: "damageStationCard",
            waiting: true,
            common: true,
            count: 0,
            reason: "emptyDeck",
          },
        ],
      })
    );
    await timeout();
  });

  test("should show special text", async () => {
    assert.elementText(
      ".guideText",
      "Your opponent is dealing damage to your station"
    );
  });
});

describe("when has draw card requirement", () => {
  beforeEach(async () => {
    const { dispatch, showPage } = setUpController();
    showPage();
    dispatch(
      "stateChanged",
      FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "action",
        requirements: [{ type: "drawCard", count: 1 }],
      })
    );
    await timeout();
  });

  test("should show that there is 1 card left to draw", () => {
    assert.elementTextStartsWith(".guideText", "Draw 1 card");
  });

  test("should NOT show skip button", () => {
    assert.elementCount(".skipDrawCard", 0);
  });
});

describe("when has draw card requirement FROM FATAL ERROR", () => {
  beforeEach(async () => {
    const { dispatch, showPage } = setUpController();
    showPage();
    dispatch(
      "stateChanged",
      FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "action",
        requirements: [
          {
            type: "drawCard",
            count: 1,
            cardCommonId: FatalError.CommonId,
          },
        ],
      })
    );
    await timeout();
  });

  test("should show that there is 1 card left to draw", () => {
    assert.elementTextStartsWith(".guideText", "Draw 1 card");
  });

  test("should show skip button", () => {
    assert.elementCount(".skipDrawCard", 1);
  });
});

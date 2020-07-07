const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const getCardImageUrl = require("../utils/getCardImageUrl.js");
const FakeState = require("../testUtils/FakeState.js");
const FakeMatchController = require("../testUtils/FakeMatchController.js");
const FullForceForward = require("../../shared/card/FullForceForward.js");
const Commander = require("../../shared/match/commander/Commander.js");
const { createController } = require("../testUtils");
const {
  assert,
  refute,
  sinon,
  timeout,
  dom: { click },
} = require("../testUtils/bocha-jest/bocha-jest.js");

let controller;
let matchController;

function setUpController(optionsAndPageDeps = {}) {
  //Has side effects to afford a convenient tear down
  matchController = FakeMatchController();
  controller = createController({ matchController, ...optionsAndPageDeps });

  return controller;
}

beforeEach(() => {
  sinon.stub(getCardImageUrl, "byCommonId").returns("/#");
});

afterEach(() => {
  getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

  controller && controller.tearDown();
  matchController = null;
  controller = null;
});

describe("misc", () => {
  test('when in "start" phase and click card on hand should NOT see ANY card ghosts', async () => {
    const { dispatch, showPage } = setUpController();
    showPage();
    dispatch(
      "stateChanged",
      FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "start",
        cardsOnHand: [createCard({ id: "C1A" })],
        stationCards: [{ place: "draw" }],
      })
    );
    await timeout();

    await click(".playerCardsOnHand .cardOnHand");

    assert.elementCount(".card-ghost", 0);
  });
});

describe("when in discard phase and is required to discard 2 cards", () => {
  beforeEach(async () => {
    const { dispatch, showPage } = setUpController();
    showPage();
    dispatch(
      "stateChanged",
      FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "discard",
        cardsOnHand: [createCard({ id: "C1A" }), createCard({ id: "C2A" })],
      })
    );
    await timeout();
  });

  test("and discards 2 cards should at least go to next phase", async () => {
    await click(".playerCardsOnHand .cardOnHand:eq(0)");
    await click(".field-player .discardPile-cardGhost:eq(0)");
    await click(".playerCardsOnHand .cardOnHand");
    await click(".field-player .discardPile-cardGhost:eq(0)");

    assert.calledWith(matchController.emit, "nextPhase");
  });

  test("and discards 1 card", async () => {
    await click(".playerCardsOnHand .cardOnHand:eq(0)");
    await click(".field-player .discardPile-cardGhost");

    refute.calledWith(matchController.emit, "nextPhase");
  });
});

describe("when has NO cards left and it is draw phase and opponent has 1 card left", () => {
  beforeEach(async () => {
    const { dispatch, showPage } = setUpController();
    showPage();
    dispatch(
      "stateChanged",
      FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "draw",
        stationCards: [
          { id: "C1A", place: "draw" },
          { id: "C2A", place: "draw" },
        ],
        playerCardsInDeckCount: 0,
        opponentCardsInDeckCount: 1,
        opponentStationCards: [{ id: "C3A", place: "draw" }],
        commanders: [Commander.TheMiller],
      })
    );
    await timeout();
  });

  test("should NOT be able to draw card", async () => {
    assert.elementCount(".drawPile-draw", 0);
  });

  test("should be able to mill", async () => {
    assert.elementCount(".drawPile-discardTopTwo", 1);
  });
});

describe("when has 1 card left and it is draw phase and opponent has NO cards left", () => {
  beforeEach(async () => {
    const { dispatch, showPage } = setUpController();
    showPage();
    dispatch(
      "stateChanged",
      FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "draw",
        playerCardsInDeckCount: 2,
        stationCards: [{ id: "C1A", place: "draw" }],
        opponentStationCards: [
          { id: "C2A", place: "draw" },
          { id: "C3A", place: "draw" },
        ],
      })
    );
    await timeout();
  });

  test("should be able to draw card", async () => {
    assert.elementCount(".drawPile-draw", 1);
  });

  test("should NOT be able to mill", async () => {
    assert.elementCount(".drawPile-discardTopTwo", 0);
  });
});

describe("when both players are out of cards", () => {
  beforeEach(async () => {
    const { dispatch, showPage } = setUpController();
    showPage();
    dispatch(
      "stateChanged",
      FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "draw",
        playerCardsInDeckCount: 2,
        stationCards: [{ id: "C1A", place: "draw" }],
        opponentStationCards: [{ id: "C2A", place: "draw" }],
      })
    );
    await timeout();
  });

  test("WORKAROUND: should be able to draw card", () => {
    //notes: You must be able to proceed when no cards are available to go past the draw phase.
    // In the future the draw phase could be skipped automatically.
    // But for now the player has to "draw a card" which will trigger a next phase because no more cards are available to draw.
    assert.elementCount(".drawPile-draw", 1);
  });
});

describe("when has FullForceForward in play and a space ship with an attack of 1 in play", () => {
  beforeEach(async () => {
    const { dispatch, showPage } = setUpController();
    showPage();
    dispatch(
      "stateChanged",
      FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "draw",
        playerCardsInDeckCount: 1,
        cardsInZone: [
          { id: "C1A", type: "spaceShip", attack: 1 },
          {
            id: "C2A",
            type: "duration",
            commonId: FullForceForward.CommonId,
          },
        ],
      })
    );
    await timeout();
  });

  test("should show +1 symbol on card", () => {
    assert.elementText(".playerCardsInZone .card-attackBoostIndicator", "1");
  });
});

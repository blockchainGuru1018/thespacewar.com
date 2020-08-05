const getCardImageUrl = require("../utils/getCardImageUrl.js");
const FakeState = require("../testUtils/FakeState.js");
const FakeMatchController = require("../testUtils/FakeMatchController.js");
const Neutralization = require("../../shared/card/Neutralization.js");
const DisturbingSensor = require("../../shared/card/DisturbingSensor.js");
const GreatDisturbance = require("../../shared/card/GreatDisturbance.js");
const { createController } = require("../testUtils");
const {
  assert,
  sinon,
  timeout,
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

describe("when has duration card Neutralization and other duration card", () => {
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
          { id: "C1A", type: "duration", commonId: Neutralization.CommonId },
          { id: "C2A", type: "duration" },
        ],
      })
    );
    await timeout();
  });

  test("other, now disabled, duration card should have a disabled overlay", () => {
    assert.elementCount(
      ".playerCardsInZone .card:eq(1) .cardDisabledOverlay",
      1
    );
  });
});

describe("when bot player has Neutralization card the latest one should be the only effective", () => {
  beforeEach(async () => {
    const { dispatch, showPage } = setUpController();
    showPage();
    dispatch(
      "stateChanged",
      FakeState({
        turn: 2,
        currentPlayer: "P2A",
        phase: "draw",
        playerCardsInDeckCount: 1,
        opponentCardsInZone: [
          { id: "C1A", type: "duration", commonId: Neutralization.CommonId },
        ],
        opponentEvents: [
          {
            type: "putDownCard",
            created: new Date("2020-06-24T11:05:00.135Z"),
            location: "zone",
            cardId: "C1A",
            cardCommonId: Neutralization.CommonId,
          },
        ],
        events: [
          {
            type: "putDownCard",
            created: new Date("2020-06-24T11:15:00.135Z"),
            location: "zone",
            cardId: "C2A",
            cardCommonId: Neutralization.CommonId,
          },
        ],
        cardsInZone: [
          { id: "C2A", type: "duration", commonId: Neutralization.CommonId },
        ],
      })
    );

    await timeout();
  });

  test("the first Neutralization card on board  should  be disabled", () => {
    assert.elementCount(".cardDisabledOverlay", 1);
  });
});

describe("when has Disturbing Sensor and a missile in play and opponent has a missile in play", () => {
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
          { id: "C1A", type: "spaceShip", commonId: DisturbingSensor.CommonId },
          { id: "C2A", type: "missile" },
        ],
        opponentCardsInZone: [{ id: "C3A", type: "missile" }],
      })
    );
    await timeout();
  });

  test("opponent missile card should have a disabled overlay", () => {
    assert.elementCount(".opponentCardsInZone .card .cardDisabledOverlay", 1);
  });

  test("player missile card should NOT have a disabled overlay", () => {
    assert.elementCount(".playerCardsInZone .cardDisabledOverlay", 0);
  });
});

describe("when has Great Disturbance in play and opponent has a other Duration card", () => {
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
          { id: "C1A", type: "duration", commonId: GreatDisturbance.CommonId },
          { id: "C2A", type: "duration" },
        ],
        opponentCardsInZone: [{ id: "C3A", type: "duration" }],
      })
    );
    await timeout();
  });

  test("opponent duration cards should have a disabled overlay", () => {
    assert.elementCount(".opponentCardsInZone .card .cardDisabledOverlay", 1);
  });

  test("player duration cards should NOT have a disabled overlay", () => {
    assert.elementCount(".playerCardsInZone .cardDisabledOverlay", 0);
  });
});

describe("when has Great Disturbance in play and play Great Disturbance later", () => {
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
                events:[
                    {type:"putDownCard",cardId:"C1A" ,cardCommonId:GreatDisturbance.CommonId, created: 1 }
                ],
                cardsInZone: [
                    { id: "C1A", type: "duration", commonId: GreatDisturbance.CommonId },
                    { id: "C2A", type: "duration" },
                ],
                opponentEvents:[ {type:"putDownCard",cardId:"C4A" ,cardCommonId:GreatDisturbance.CommonId, created: 2 }],
                opponentCardsInZone: [
                    { id: "C3A", type: "duration" },
                    { id: "C4A", type: "duration", commonId: GreatDisturbance.CommonId }],
            })
        );
        await timeout();
    });

    test("lasted player that played GreatDisturbance should be the winning", () => {
        assert.elementCount(".opponentCardsInZone .card .cardDisabledOverlay", 0);
    });

    test("first player that played GreatDisturbance should have duration disabled", () => {
        assert.elementCount(".playerCardsInZone .cardDisabledOverlay", 2);
    });
});




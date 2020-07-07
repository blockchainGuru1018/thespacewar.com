const getCardImageUrl = require("../utils/getCardImageUrl.js");
const FakeState = require("../testUtils/FakeState.js");
const FakeMatchController = require("../testUtils/FakeMatchController.js");
const { createController } = require("../testUtils");
const {
    sinon,
    timeout,
    fakeClock,
    dom: { click },
} = require("../testUtils/bocha-jest/bocha-jest.js");

let controller;
let matchController;
let clock;

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
    clock && clock.restore();
    matchController = null;
    controller = null;
});

describe("prevent accidental clicks of the next phase button", () => {
    test("when can go to action phase and phase after that is discard phase, should disabled button after pressing Go To Action Phase", async () => {
        clock = fakeClock("2000-01-01T00:00:06.000Z");
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch(
            "stateChanged",
            playerCanGoToActionPhase_andDiscardPhaseIsNext()
        );
        await timeout(clock);

        await click(".nextPhaseButton", clock);
        await timeout(clock, 100);

        expectElementToBeDisabled(".nextPhaseButton");
    });

    test('when in preparation phase and click "Go to action phase" the next phase button should be enabled after 1 second', async () => {
        clock = fakeClock("2000-01-01T00:00:06.000Z");
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch(
            "stateChanged",
            FakeState({
                turn: 1,
                currentPlayer: "P1A",
                phase: "preparation",
            })
        );
        await timeout(clock);

        await click(".nextPhaseButton", clock);

        await timeout(clock, 1000);
        expectElementNotToBeDisabled(".nextPhaseButton");
    });

    test("when can go to action phase and button after that says End Turn, should disabled button after pressing Go To Action Phase", async () => {
        clock = fakeClock("2000-01-01T00:00:06.000Z");
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch("stateChanged", playerCanGoToActionPhase_andCanThenEndTurn());
        await timeout(clock);

        await click(".nextPhaseButton", clock);
        await timeout(clock, 100);

        expectElementToBeDisabled(".nextPhaseButton-endTurn");
    });

    test("when can go to action phase and button after that says End Turn, should ENABLE button after 1 second of press", async () => {
        clock = fakeClock("2000-01-01T00:00:06.000Z");
        const { dispatch, showPage } = setUpController();
        showPage();
        dispatch("stateChanged", playerCanGoToActionPhase_andCanThenEndTurn());
        await timeout(clock);

        await click(".nextPhaseButton", clock);
        await timeout(clock, 100);

        await timeout(clock, 1000);
        expectElementNotToBeDisabled(".nextPhaseButton-endTurn");
    });
});

function expectElementToBeDisabled(elementSelector) {
    const element = document.querySelector(elementSelector);
    expect(element.disabled).toBe(true);
}

function expectElementNotToBeDisabled(elementSelector) {
    const element = document.querySelector(elementSelector);
    expect(element.disabled).toBe(false);
}

function playerCanGoToActionPhase_andDiscardPhaseIsNext() {
    return FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "preparation",
        cardsOnHand: [{ id: "C1A", cost: 0, type: "spaceShip" }],
        stationCard: [{ place: "draw" }],
    });
}

function playerCanGoToActionPhase_andCanThenEndTurn() {
    return FakeState({
        turn: 1,
        currentPlayer: "P1A",
        phase: "preparation",
        cardsOnHand: [],
    });
}

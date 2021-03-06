const getCardImageUrl = require("../utils/getCardImageUrl.js");
const FakeState = require("../testUtils/FakeState.js");
const FakeMatchController = require("../testUtils/FakeMatchController.js");
const PutDownCardEvent = require("../../shared/PutDownCardEvent.js");
const Luck = require("../../shared/card/Luck.js");
const Avoid = require("../../shared/card/Avoid.js");
const {createController} = require("../testUtils");
const {
    assert,
    timeout,
    dom: {click},
} = require("../testUtils/bocha-jest/bocha-jest.js");

let controller;
let matchController;

function setUpController(optionsAndPageDeps = {}) {
    //Has side effects to afford a convenient tear down
    matchController = FakeMatchController();
    controller = createController({matchController, ...optionsAndPageDeps});

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

const mockLocalStorageResponse = (response) => {
    Object.defineProperty(window, "localStorage", {
        value: {
            getItem: jest.fn(() => response),
            setItem: jest.fn(() => true),
        },
        writable: true,
    });
};

describe("when phase is wait but is current player", () => {
    beforeEach(async () => {
        const {dispatch, showPage} = setUpController();
        showPage();
        dispatch(
            "stateChanged",
            FakeState({
                turn: 1,
                currentPlayer: "P1A",
                cardsOnHand: [{id: "C1A", cost: 0}],
                phase: "wait",
            })
        );
        await timeout();
    });

    test("guide text should mention that you have taken control", async () => {
        assert.elementText(".guideText", "Put down any 0-cost card");
        assert.elementText(".toggleControlOfTurn", "Release control");
    });
});

describe("when phase is wait and is NOT current player", () => {
    beforeEach(async () => {
        const {dispatch, showPage} = setUpController();
        showPage();
        dispatch(
            "stateChanged",
            FakeState({
                turn: 1,
                currentPlayer: "P2A",
                cardsOnHand: [{id: "C1A", cost: 0}],
                phase: "wait",
            })
        );
        await timeout();
    });

    test("guide text should mention that it is the opponents turn", async () => {
        assert.elementText(".guideText", "Enemy turn");
        assert.elementText(".toggleControlOfTurn", "Take control");
    });
});

describe("when phase is wait and is NOT current and player have not zero cost cards", () => {
    beforeEach(async () => {
        mockLocalStorageResponse("true");
        const {dispatch, showPage} = setUpController();
        showPage();
        dispatch(
            "stateChanged",
            FakeState({
                turn: 1,
                currentPlayer: "P2A",
                phase: "wait",
            })
        );
        await timeout();
    });

    test("should not see Take Control button", async () => {
        assert.elementCount(".toggleControlOfTurn", 1);
        assert.elementHasClass(".toggleControlOfTurn", "hidden");
    });
});

describe("when phase is action but is not current player", () => {
    beforeEach(async () => {
        const {dispatch, showPage} = setUpController();
        showPage();
        dispatch(
            "stateChanged",
            FakeState({
                turn: 1,
                currentPlayer: "P2A",
                phase: "action",
            })
        );
        await timeout();
    });

    test("guide text should mention that you do NOT have control", async () => {
        assert.elementText(".guideText", "Your opponent has taken control");
        assert.elementText(".guideText-subText", "wait to have it back");
    });
});

describe("when is holding a card and opponent takes control of turn", () => {
    beforeEach(async () => {
        const {dispatch, showPage} = setUpController();
        showPage();
        dispatch(
            "stateChanged",
            FakeState({
                turn: 1,
                currentPlayer: "P1A",
                phase: "action",
                cardsOnHand: [{id: "C1A", cost: 0}],
            })
        );
        await timeout();
        await click(".playerCardsOnHand .cardOnHand");

        dispatch("stateChanged", {currentPlayer: "P2A"});
        await timeout();
    });

    test("should drop card", async () => {
        assert.elementCount(".holdingCard", 0);
    });
});

describe("when has taken control of the turn and is holding a 0 cost card", () => {
    beforeEach(async () => {
        const {dispatch, showPage} = setUpController();
        showPage();
        dispatch(
            "stateChanged",
            FakeState({
                turn: 1,
                currentPlayer: "P1A",
                phase: "wait",
                cardsOnHand: [{id: "C1A", cost: 0}],
            })
        );
        await timeout();

        await click(".playerCardsOnHand .cardOnHand");
    });

    test("should show zone ghost", async () => {
        assert.elementCount(".playerCardsInZone .card-ghost", 1);
    });
});

describe("when has taken control of the turn and is holding a card costing more than 0", () => {
    beforeEach(async () => {
        const {dispatch, showPage} = setUpController();
        showPage();
        dispatch(
            "stateChanged",
            FakeState({
                turn: 1,
                currentPlayer: "P1A",
                phase: "wait",
                cardsOnHand: [{id: "C1A", cost: 1}],
            })
        );
        await timeout();

        await click(".playerCardsOnHand .cardOnHand");
    });

    test('should see "cannot play card" home zone ghost', () => {
        assert.elementCount(".playerCardsInZone .card-ghost--deactivatedZone", 1);
    });
});

describe("when Avoid its on table it should display take control Button", () => {
    beforeEach(async () => {
        const {dispatch, showPage} = setUpController();
        showPage();
        dispatch(
            "stateChanged",
            FakeState({
                turn: 1,
                currentPlayer: "P2A",
                phase: "wait",
                cardsInZone: [{id: "C1A", commonId: Avoid.CommonId}],
            })
        );
        await timeout();
    });

    test("should see take Control Button", () => {
        assert.elementHasClass(".toggleControlOfTurn", "visible");
    });
});

describe("when is holding a card costing 0 and some card its adding costInflation", () => {
    beforeEach(async () => {
        const {dispatch, showPage} = setUpController();
        showPage();
        dispatch(
            "stateChanged",
            FakeState({
                turn: 1,
                currentPlayer: "P2A",
                phase: "wait",
                cardsOnHand: [{id: "C1A", cost: 0}],
                cardsInZone: [
                    {
                        id: "C2A",
                        cost: 1,
                        commonId: "89",
                        allCardsCostIncrementEffect: 3,
                    },
                ],
            })
        );
        await timeout();
    });

    test("should not see take Control Button", () => {
        assert.elementHasClass(".toggleControlOfTurn", "hidden");
    });

    test("should see text indicating the amount of cost inflation", () => {
        assert.elementText(".guideText", "All cards cost 3 more actions to play.");
    });
});

// describe("when it is your draw phase, but is able to counter", () => {
//   beforeEach(async () => {
//     const { dispatch, showPage } = setUpController();
//     showPage();
//     dispatch(
//       "stateChanged",
//       FakeState({
//         turn: 1,
//         currentPlayer: "P1A",
//         cardsOnHand: [{ id: "C1A", cost: 0, commonId: Luck.CommonId }],
//         phase: "draw",
//         opponentEvents: [
//           PutDownCardEvent.forTest({
//             cost: 1,
//             location: "zone",
//           }),
//         ],
//       })
//     );
//     await timeout();
//   });
//
//   test("should show counter alert", async () => {
//     assert.elementCount(".counterAlert", 1);
//   });
// });

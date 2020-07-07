const FakeCardDataAssembler = require("../../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const PutDownCardEvent = require("../../../shared/PutDownCardEvent.js");
const MoveCardEvent = require("../../../shared/event/MoveCardEvent.js");
const getCardImageUrl = require("../../utils/getCardImageUrl.js");
const FakeState = require("../../testUtils/FakeState.js");
const FakeMatchController = require("../../testUtils/FakeMatchController.js");
const Commander = require("../../../shared/match/commander/Commander.js");
const { createController: createTestController } = require("../../testUtils");
const {
    assert,
    refute,
    sinon,
    timeout,
    stub,
    fakeClock,
    dom: { click },
} = require("../../testUtils/bocha-jest/bocha-jest.js");

const FastMissileId = "6";

let controller;
let matchController;
let clock;

function createController({ matchController = FakeMatchController() } = {}) {
    //Has side effects to afford a convenient tear down
    controller = createTestController({ matchController });
    return controller;
}

beforeEach(async () => {
    sinon.stub(getCardImageUrl, "byCommonId").returns("/#");

    controller = createController();
});

afterEach(() => {
    clock && clock.restore();
    getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();

    controller && controller.tearDown();

    controller = null;
    clock = null;
    matchController = null;
});

describe("attack phase:", () => {
    describe.skip("when card has attack level 2 and attack last opponent station card that is NOT flipped", () => {
        beforeEach(async () => {
            matchController = FakeMatchController();
            const { dispatch } = createController({
                matchController: matchController,
            });
            controller.showPage();
            dispatch(
                "stateChanged",
                FakeState({
                    turn: 3,
                    currentPlayer: "P1A",
                    phase: "attack",
                    cardsInOpponentZone: [createCard({ id: "C1A", attack: 2 })],
                    events: [
                        PutDownCardEvent({
                            turn: 1,
                            cardId: "C1A",
                            location: "zone",
                        }),
                        MoveCardEvent({ turn: 2, cardId: "C1A" }),
                    ],
                    opponentStationCards: [
                        { id: "C2A", place: "action" },
                        {
                            id: "C3A",
                            place: "action",
                            flipped: true,
                            card: createCard({ id: "C3A" }),
                        },
                    ],
                })
            );
            await timeout();

            await click(".playerCardsInOpponentZone .readyToAttack");
            await click(".field-opponentStation .attackable");
        });
        test("should send attack", () => {
            assert.calledOnceWith(matchController.emit, "attackStationCard", {
                attackerCardId: "C1A",
                targetStationCardIds: ["C2A"],
            });
        });
    });
    describe("when game has ended and opponent has lost", () => {
        beforeEach(async () => {
            clock = fakeClock();
            const { dispatch } = createController();
            controller.showPage();

            dispatch(
                "stateChanged",
                FakeState({
                    turn: 3,
                    currentPlayer: "P1A",
                    phase: "attack",
                    stationCards: [
                        {
                            id: "C1A",
                            place: "action",
                            card: createCard({ id: "C1A" }),
                        },
                    ],
                    ended: true,
                    retreatedPlayerId: "P2A",
                })
            );
            await timeout(clock);
        });
        test("should show victory text", async () => {
            await timeout(clock, 5000);
            assert.elementCount(".victoryText", 1);
        });
        test("should show end game overlay", async () => {
            await timeout(clock, 5000);
            assert.elementCount(".endGameOverlay", 1);
        });
    });
    describe("when game ended and you lost", () => {
        beforeEach(async () => {
            clock = fakeClock();
            const { dispatch } = createController();
            controller.showPage();

            dispatch(
                "stateChanged",
                FakeState({
                    turn: 3,
                    currentPlayer: "P1A",
                    phase: "attack",
                    ended: true,
                    retreatedPlayerId: "P1A",
                })
            );
            await timeout(clock);
        });
        test("should NOT show victory text", async () => {
            await timeout(clock, 5000);
            assert.elementCount(".victoryText", 0);
        });
        test("should show defeat text", async () => {
            await timeout(clock, 5000);
            assert.elementCount(".defeatText", 1);
        });
        test("should show end game overlay", async () => {
            await timeout(clock, 5000);
            assert.elementCount(".endGameOverlay", 1);
        });
    });
    describe.skip("when moved card to opponent zone last turn", () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch(
                "stateChanged",
                FakeState({
                    turn: 3,
                    currentPlayer: "P1A",
                    phase: "attack",
                    cardsInOpponentZone: [{ id: "C1A" }],
                    events: [
                        PutDownCardEvent({ turn: 1, cardId: "C1A" }),
                        MoveCardEvent({ turn: 2, cardId: "C1A" }),
                    ],
                })
            );
            await timeout();
        });
        test("should be able to select card to move back", () => {
            assert.elementCount(".playerCardsInOpponentZone .card .movable", 1);
        });
    });
    describe.skip("when moved card to opponent zone this turn", () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch(
                "stateChanged",
                FakeState({
                    turn: 2,
                    currentPlayer: "P1A",
                    phase: "attack",
                    cardsInOpponentZone: [{ id: "C1A" }],
                    events: [
                        PutDownCardEvent({ turn: 1, cardId: "C1A" }),
                        MoveCardEvent({ turn: 2, cardId: "C1A" }),
                    ],
                })
            );
            await timeout();
        });
        test("should NOT be able to select card to move back", () => {
            assert.elementCount(".playerCardsInOpponentZone .card .movable", 0);
        });
    });
    describe.skip("when moved Fast Missile to opponent zone THIS turn", () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch(
                "stateChanged",
                FakeState({
                    turn: 2,
                    currentPlayer: "P1A",
                    phase: "attack",
                    cardsInOpponentZone: [
                        { id: "C1A", commonId: FastMissileId },
                    ],
                    events: [
                        PutDownCardEvent({ turn: 1, cardId: "C1A" }),
                        MoveCardEvent({ turn: 2, cardId: "C1A" }),
                    ],
                })
            );
            await timeout();
        });
        test("should NOT be able to select card to move back", () => {
            assert.elementCount(".playerCardsInOpponentZone .card .movable", 0);
        });
    });
    describe.skip("when put down Fast missile this turn and select for attack", () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch(
                "stateChanged",
                FakeState({
                    turn: 1,
                    currentPlayer: "P1A",
                    phase: "attack",
                    cardsInZone: [
                        { id: "C1A", attack: 1, commonId: FastMissileId },
                    ],
                    opponentCardsInPlayerZone: [{ id: "C2A" }],
                    events: [PutDownCardEvent({ turn: 1, cardId: "C1A" })],
                })
            );
            await timeout();

            await click(".playerCardsInZone .card .readyToAttack");
        });
        test("should NOT be able to attack a station card", () => {
            assert.elementCount(".field-opponentStation .attackable", 0);
        });
    });
});
describe("discard card requirement", () => {
    describe("when have discard card requirement", () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch(
                "stateChanged",
                FakeState({
                    turn: 1,
                    currentPlayer: "P1A",
                    phase: "draw",
                    stationCards: [{ place: "draw" }],
                    requirements: [{ type: "discardCard", count: 2 }],
                })
            );
            await timeout();
        });
        test("should NOT show next phase button", () => {
            assert.elementCount(".nextPhaseButton", 0);
        });
        test("should NOT show end turn button", () => {
            assert.elementCount(".nextPhaseButton-endTurn", 0);
        });
        test("should show guide text", () => {
            assert.elementText(".guideText", "Discard 2 cards");
        });
        test("should NOT be able to select any station card", () => {
            assert.elementCount(".stationCard .selectable", 0);
        });
    });
    describe('when have draw card requirement with "waiting" set to true', () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch(
                "stateChanged",
                FakeState({
                    turn: 1,
                    currentPlayer: "P1A",
                    phase: "draw",
                    stationCards: [{ place: "draw" }],
                    requirements: [{ type: "drawCard", waiting: true }],
                })
            );
            await timeout();
        });
        test("should NOT show next phase button", () => {
            assert.elementCount(".nextPhaseButton", 0);
        });
        test("should NOT show end turn button", () => {
            assert.elementCount(".nextPhaseButton-endTurn", 0);
        });
        test("should show guide text", () => {
            assert.elementCount(".guideText", 1);
            assert.elementCount(".guideText-waitingForOtherPlayer", 1);
        });
        test("should NOT be able to draw card", () => {
            assert.elementCount(".drawPile-draw", 0);
        });
    });
});

describe("draw card requirement", () => {
    describe("when have draw card requirement", () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch(
                "stateChanged",
                FakeState({
                    turn: 1,
                    currentPlayer: "P1A",
                    phase: "action",
                    opponentStationCards: [{ place: "draw" }],
                    requirements: [{ type: "drawCard", count: 2 }],
                    commanders: [Commander.TheMiller],
                })
            );
            await timeout();
        });
        test("should show guide text", () => {
            assert.elementTextStartsWith(
                ".guideText",
                "Draw card or Mill opponent (x2)"
            );
        });
        test("should show draw pile action overlay", () => {
            assert.elementCount(".drawPile-draw", 1);
        });
    });
    describe("when have a draw card requirement in the draw phase", () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch(
                "stateChanged",
                FakeState({
                    turn: 1,
                    currentPlayer: "P1A",
                    phase: "draw",
                    requirements: [{ type: "drawCard", count: 2 }],
                    commanders: [Commander.TheMiller],
                })
            );
            await timeout();
        });
        test("should show opponent draw pile mill action overlay", () => {
            assert.elementCount(".drawPile-discardTopTwo", 1);
        });
        test("should show opponent draw pile help text", () => {
            assert.elementCount(".opponentDrawPileDescription", 1);
        });
    });
    describe("when have discard card requirement but a draw card requirement is the first", () => {
        beforeEach(async () => {
            const { dispatch } = createController();
            controller.showPage();

            dispatch(
                "stateChanged",
                FakeState({
                    turn: 1,
                    currentPlayer: "P1A",
                    phase: "action",
                    requirements: [
                        { type: "drawCard", count: 2 },
                        { type: "discardCard", count: 2 },
                    ],
                    commanders: [Commander.TheMiller],
                })
            );
            await timeout();
        });
        test("should show draw card guide text", () => {
            assert.elementTextStartsWith(
                ".guideText",
                "Draw card or Mill opponent (x2)"
            );
        });
    });
});

const {
    assert,
    refute,
    sinon,
} = require("./testUtils/bocha-jest/bocha-jest.js");
const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const FatalError = require("../../shared/card/FatalError.js");
const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");

const FatalErrorCommonId = FatalError.CommonId;

const SameCostAsFatalError = 0; //Can be whatever, just has to be consistent in test

test("when put down fatal error and choice as an opponent unflipped station card should throw error", () => {
    const { match } = setupIntegrationTest({
        playerStateById: {
            turn: 1,
            P1A: {
                phase: "action",
                cardsOnHand: [
                    createCard({
                        id: "C1A",
                        commonId: FatalError.CommonId,
                        cost: SameCostAsFatalError,
                    }),
                ],
            },
            P2A: {
                stationCards: [
                    stationCard({
                        id: "C2A",
                        flipped: false,
                        card: { cost: SameCostAsFatalError },
                    }),
                    stationCard({ id: "C3A", flipped: true }),
                ],
            },
        },
    });

    const error = catchError(() =>
        match.putDownCard("P1A", {
            location: "zone",
            cardId: "C1A",
            choice: "C2A",
        })
    );

    expect(error).toBeTruthy();
    expect(error.message).toBe("Cannot put down card");
});

test("when put down fatal error and choice is a FLIPPED station card SHOULD throw error", () => {
    const { match } = setupIntegrationTest({
        playerStateById: {
            turn: 1,
            P1A: {
                phase: "action",
                cardsOnHand: [
                    createCard({
                        id: "C1A",
                        commonId: FatalError.CommonId,
                        cost: SameCostAsFatalError,
                    }),
                ],
                stationCards: [
                    stationCard({ place: "action", flipped: false, id: "S1A" }),
                ],
            },
            P2A: {
                stationCards: [
                    stationCard({
                        id: "C2A",
                        flipped: true,
                        card: { cost: SameCostAsFatalError },
                    }),
                    stationCard({ id: "C3A", flipped: false }),
                ],
            },
        },
    });

    const error = catchError(() =>
        match.putDownCard("P1A", {
            location: "zone",
            cardId: "C1A",
            choice: "C2A",
        })
    );

    expect(error).toBeTruthy();
});

test("when player put down Fatal Error should emit FatalErrorUsed event to player", () => {
    const { firstPlayerAsserter, match } = setupIntegrationTest({
        playerStateById: {
            P1A: {
                phase: "action",
                cardsOnHand: [
                    createCard({
                        id: "C1A",
                        type: "event",
                        commonId: FatalErrorCommonId,
                        cost: SameCostAsFatalError,
                    }),
                ],
            },
            P2A: {
                cardsInOpponentZone: [
                    createCard({
                        id: "C2A",
                        commonId: "C2B",
                        cost: SameCostAsFatalError,
                    }),
                ],
                cardsInDeck: [
                    createCard({ id: "C3A" }),
                    createCard({ id: "C4A" }),
                ],
            },
        },
    });

    match.putDownCard("P1A", {
        location: "zone",
        cardId: "C1A",
        choice: "C2A",
    });

    firstPlayerAsserter.hasEvent((event) => {
        return (
            event.type === "fatalErrorUsed" &&
            event.targetCardCommonId === "C2B"
        );
    });
});

function catchError(callback) {
    try {
        callback();
    } catch (error) {
        return error;
    }
}

function stationCard({ place = "draw", flipped, id, card = {} }) {
    return {
        place,
        flipped,
        card: { id, ...card },
    };
}

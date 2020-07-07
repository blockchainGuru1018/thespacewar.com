const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");
const MatchMode = require("../../shared/match/MatchMode.js");

describe("log winner after game", () => {
    test("when SECOND player won should register win", () => {
        const registerLogGame = jest
            .fn()
            .mockImplementation(() => Promise.resolve());
        const { match } = setupIntegrationTest(
            {
                playerStateById: {
                    P1A: {
                        stationCards: [],
                    },
                    P2A: {
                        stationCards: [stationCard({ id: "S2A" })],
                    },
                },
            },
            { matchDeps: { registerLogGame } }
        );

        match.refresh("P1A");

        expect(registerLogGame).toBeCalledWith(
            "P2A",
            "P1A",
            expect.any(Number)
        );
    });

    test("when FIRST player won should register win", () => {
        const registerLogGame = jest
            .fn()
            .mockImplementation(() => Promise.resolve());
        const { match } = setupIntegrationTest(
            {
                playerStateById: {
                    P1A: {
                        stationCards: [stationCard({ id: "S2A" })],
                    },
                    P2A: {
                        stationCards: [],
                    },
                },
            },
            { matchDeps: { registerLogGame } }
        );

        match.refresh("P1A");

        expect(registerLogGame).toBeCalledWith(
            "P1A",
            "P2A",
            expect.any(Number)
        );
    });

    /*test('when the player wins against a Bot, should NOT log game', () => {
        const registerLogGame = jest.fn().mockImplementation(() => Promise.resolve());
        const {match} = setupIntegrationTest({
            playerOrder: ['P1A', 'BOT'],
            playerStateById: {
                'P1A': {
                    stationCards: [stationCard({id: 'S1A'})]
                },
                'BOT': {
                    stationCards: []
                }
            }
        }, {
            playerId: 'P1A',
            opponentId: 'BOT',
            matchDeps: {registerLogGame}
        });

        match.refresh('P1A');

        expect(registerLogGame).toBeCalledWith('BOT', 'P1A', expect.any(Number));
    });*/

    /*test('Player LOSES against BOT, should NOT LOG GAME', () => {
        const registerLogGame = jest.fn().mockImplementation(() => Promise.resolve());
        const {match} = setupIntegrationTest({
            playerOrder: ['P1A', 'BOT'],
            playerStateById: {
                'P1A': {
                    stationCards: []
                },
                'BOT': {
                    stationCards: [stationCard({id: 'S1A'})]
                }
            }
        }, {
            playerId: 'BOT',
            opponentId: 'P1A',
            matchDeps: {registerLogGame}
        });

        match.refresh('P1A');

        expect(registerLogGame).toBeCalledWith('P1A', 'BOT', expect.any(Number));
    });*/

    test("Any player retreats, should log game", () => {
        const registerLogGame = jest
            .fn()
            .mockImplementation(() => Promise.resolve());
        const { match } = setupIntegrationTest(
            {
                playerOrder: ["P1A", "P2A"],
                playerStateById: {
                    P1A: {
                        stationCards: [stationCard({ id: "S2A" })],
                    },
                    P2A: {
                        stationCards: [stationCard({ id: "S1A" })],
                    },
                },
            },
            {
                playerId: "P2A",
                opponentId: "P1A",
                matchDeps: { registerLogGame },
            }
        );

        match.retreat("P1A");

        expect(registerLogGame).toBeCalledWith(
            "P2A",
            "P1A",
            expect.any(Number)
        );
    });

    test("If player retreats, should ONLY log game ONCE", () => {
        const registerLogGame = jest
            .fn()
            .mockImplementation(() => Promise.resolve());
        const { match } = setupIntegrationTest(
            {
                playerOrder: ["P1A", "P2A"],
                playerStateById: {
                    P1A: {
                        stationCards: [stationCard({ id: "S2A" })],
                    },
                    P2A: {
                        stationCards: [stationCard({ id: "S1A" })],
                    },
                },
            },
            {
                playerId: "P2A",
                opponentId: "P1A",
                matchDeps: { registerLogGame },
            }
        );

        match.retreat("P1A");
        match.retreat("P1A");

        expect(registerLogGame).toBeCalledTimes(1);
    });

    test("When player retreats against Bot, should NOT log game", () => {
        const registerLogGame = jest
            .fn()
            .mockImplementation(() => Promise.resolve());
        const { match } = setupIntegrationTest(
            {
                playerOrder: ["P1A", "BOT"],
                playerStateById: {
                    P1A: {
                        stationCards: [stationCard({ id: "S2A" })],
                    },
                    BOT: {
                        stationCards: [stationCard({ id: "S1A" })],
                    },
                },
            },
            {
                playerId: "P1A",
                opponentId: "BOT",
                matchDeps: { registerLogGame },
            }
        );

        match.retreat("P1A");

        expect(registerLogGame).toBeCalledWith(
            "BOT",
            "P1A",
            expect.any(Number)
        );
    });

    test("if player retreats BEFORE game starts, should NOT log game", () => {
        const registerLogGame = jest
            .fn()
            .mockImplementation(() => Promise.resolve());
        const { match } = setupIntegrationTest(
            {
                mode: MatchMode.selectStationCards,
                playerOrder: ["P1A", "P2A"],
                playerStateById: {
                    P1A: {
                        stationCards: [stationCard({ id: "S2A" })],
                    },
                    P2A: {
                        stationCards: [stationCard({ id: "S1A" })],
                    },
                },
            },
            {
                playerId: "P1A",
                opponentId: "P2A",
                matchDeps: { registerLogGame },
            }
        );

        match.retreat("P1A");

        expect(registerLogGame).not.toBeCalled();
    });
});

function stationCard({ place = "draw", flipped = false, id }) {
    return {
        place,
        flipped,
        card: { id },
    };
}

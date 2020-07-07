const {
    bocha: { assert, refute, sinon },
    createCard,
    createPlayer,
    Player,
    createMatch,
    FakeConnection2,
    catchError,
    createState,
} = require("./shared.js");
const { COMMON_PHASE_ORDER } = require("../../../../shared/phases.js");
const FakeDeck = require("../../testUtils/FakeDeck.js");
const DisturbingSensor = require("../../../../shared/card/DisturbingSensor.js");
const PutDownCardEvent = require("../../../../shared/PutDownCardEvent.js");
const GoodKarmaCommonId = "11";
const NeutralizationCommonId = "12";

module.exports = {
    "when is not own players turn should throw error": function () {
        const match = createMatch({ players: [Player("P1A"), Player("P2A")] });
        match.restoreFromState(
            createState({
                currentPlayer: "P1A",
                playerStateById: {
                    P2A: {
                        phase: "wait",
                    },
                },
            })
        );

        const error = catchError(() =>
            match.nextPhase("P2A", { currentPhase: "wait" })
        );

        assert.equals(error.message, "Switching phase when not your own turn");
        assert.equals(error.type, "CheatDetected");
    },
    "when player of the turn is player one and current phase is the last one and go to next phase": {
        async setUp() {
            this.playerOneConnection = FakeConnection2(["stateChanged"]);
            this.playerTwoConnection = FakeConnection2(["stateChanged"]);
            const match = createMatch({
                players: [
                    createPlayer({
                        id: "P1A",
                        connection: this.playerOneConnection,
                    }),
                    createPlayer({
                        id: "P2A",
                        connection: this.playerTwoConnection,
                    }),
                ],
            });
            const playerPhase =
                COMMON_PHASE_ORDER[COMMON_PHASE_ORDER.length - 1];
            match.restoreFromState(
                createState({
                    currentPlayer: "P1A",
                    playerOrder: ["P1A", "P2A"],
                    playerStateById: {
                        P1A: {
                            phase: playerPhase,
                        },
                    },
                })
            );

            match.nextPhase("P1A", { currentPhase: playerPhase });
        },
        "should broadcast next player of the turn and turn count of 1 to playerOne"() {
            assert.calledWith(
                this.playerOneConnection.stateChanged,
                sinon.match({ turn: 1, currentPlayer: "P2A" })
            );
        },
        "should broadcast next player of the turn and turn count of 1 to playerTwo"() {
            assert.calledWith(
                this.playerTwoConnection.stateChanged,
                sinon.match({ turn: 1, currentPlayer: "P2A" })
            );
        },
    },
    "when player of the turn is player two and current phase is the last one": {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
            this.secondPlayerConnection = FakeConnection2(["stateChanged"]);
            const players = [
                Player("P1A", this.firstPlayerConnection),
                Player("P2A", this.secondPlayerConnection),
            ];
            const match = createMatch({ players });
            const opponentPhase =
                COMMON_PHASE_ORDER[COMMON_PHASE_ORDER.length - 1];
            match.restoreFromState(
                createState({
                    currentPlayer: "P2A",
                    playerStateById: {
                        P1A: {
                            phase: "wait",
                        },
                        P2A: {
                            phase: opponentPhase,
                        },
                    },
                })
            );

            match.nextPhase("P2A", { currentPhase: opponentPhase });
        },
        "should broadcast next player of the turn and turn count of 2 to first player"() {
            assert.calledWith(
                this.firstPlayerConnection.stateChanged,
                sinon.match({ turn: 2, currentPlayer: "P1A" })
            );
        },
        "should broadcast next player of the turn and turn count of 2 to second player"() {
            assert.calledWith(
                this.secondPlayerConnection.stateChanged,
                sinon.match({ turn: 2, currentPlayer: "P1A" })
            );
        },
    },
    "when enter draw phase and has NO cards left in deck": {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
            this.secondPlayerConnection = FakeConnection2(["stateChanged"]);
            this.match = createMatch({
                players: [
                    Player("P1A", this.firstPlayerConnection),
                    Player("P2A", this.secondPlayerConnection),
                ],
            });
            this.match.restoreFromState(
                createState({
                    turn: 1,
                    currentPlayer: "P2A",
                    playerStateById: {
                        P1A: {
                            phase: "wait",
                            stationCards: [
                                { card: createCard({ id: "C1A" }) },
                                { card: createCard({ id: "C2A" }) },
                                { card: createCard({ id: "C3A" }) },
                            ],
                            cardsInDeck: [],
                        },
                        P2A: {
                            phase: "attack",
                        },
                    },
                })
            );

            this.match.nextPhase("P2A", { currentPhase: "attack" });
        },
        "should add damage station card requirement to second player"() {
            this.match.refresh("P2A");
            assert.calledWith(
                this.secondPlayerConnection.stateChanged,
                sinon.match({
                    requirements: [
                        {
                            type: "damageStationCard",
                            count: sinon.match.number,
                            common: true,
                            reason: "emptyDeck",
                        },
                    ],
                })
            );
        },
        "should add empty, but common, damage station card requirement to first player"() {
            this.match.refresh("P1A");
            assert.calledWith(
                this.firstPlayerConnection.stateChanged,
                sinon.match({
                    requirements: [
                        {
                            type: "damageStationCard",
                            count: 0,
                            common: true,
                            waiting: true,
                            reason: "emptyDeck",
                        },
                    ],
                })
            );
        },
    },
    "when first player is in the preparation phase and goes to next phase": {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2([
                "drawCards",
                "stateChanged",
            ]);
            this.match = createMatch({
                players: [
                    Player("P1A", this.firstPlayerConnection),
                    Player("P2A"),
                ],
            });
            this.match.restoreFromState(
                createState({
                    turn: 2,
                    currentPlayer: "P1A",
                    playerStateById: {
                        P1A: {
                            phase: "preparation",
                            cardsInZone: [
                                createCard({ id: "C1A", type: "duration" }),
                            ],
                            events: [
                                PutDownCardEvent({
                                    turn: 1,
                                    location: "zone",
                                    cardId: "C1A",
                                }),
                            ],
                        },
                    },
                })
            );

            this.match.nextPhase("P1A", { currentPhase: "preparation" });
        },
        "should be in action phase": function () {
            this.match.refresh("P1A");
            const {
                phase,
            } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
            assert.equals(phase, "action");
        },
    },
    "Neutralization:": {
        "when opponent has Neutralization and has Good Karma and leave draw phase": {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
                this.match = createMatch({
                    players: [
                        Player("P1A", this.firstPlayerConnection),
                        Player("P2A"),
                    ],
                });
                this.match.restoreFromState(
                    createState({
                        turn: 2,
                        currentPlayer: "P1A",
                        playerStateById: {
                            P1A: {
                                phase: "draw",
                                cardsInZone: [
                                    createCard({
                                        id: "C1A",
                                        type: "duration",
                                        commonId: GoodKarmaCommonId,
                                    }),
                                ],
                            },
                            P2A: {
                                cardsInZone: [
                                    createCard({
                                        id: "C1A",
                                        type: "duration",
                                        commonId: NeutralizationCommonId,
                                    }),
                                ],
                            },
                        },
                    })
                );

                this.match.nextPhase("P1A", { currentPhase: "draw" });
            },
            "should NOT have added any requirements"() {
                assert.calledWith(
                    this.firstPlayerConnection.stateChanged,
                    sinon.match({
                        requirements: [],
                    })
                );
            },
        },
    },
    "Disturbing sensor:": {
        "when opponent has disturbing sensor in play and player has 2 cards on hand and leaves draw phase": {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
                this.match = createMatch({
                    players: [
                        Player("P1A", this.firstPlayerConnection),
                        Player("P2A"),
                    ],
                });
                this.match.restoreFromState(
                    createState({
                        turn: 1,
                        currentPlayer: "P1A",
                        playerStateById: {
                            P1A: {
                                phase: "draw",
                                cardsOnHand: [
                                    createCard({ id: "C1A" }),
                                    createCard({ id: "C2A" }),
                                ],
                            },
                            P2A: {
                                cardsInZone: [
                                    createCard({
                                        id: "C3A",
                                        type: "spaceShip",
                                        commonId: DisturbingSensor.CommonId,
                                    }),
                                ],
                            },
                        },
                    })
                );

                this.match.nextPhase("P1A", { currentPhase: "draw" });
            },
            "should emit requirement to player"() {
                assert.calledWith(
                    this.firstPlayerConnection.stateChanged,
                    sinon.match({
                        requirements: [
                            sinon.match({ type: "discardCard", count: 1 }),
                        ],
                    })
                );
            },
        },
        "when opponent has disturbing sensor in play and player has 1 card on hand and leaves draw phase": {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
                this.match = createMatch({
                    players: [
                        Player("P1A", this.firstPlayerConnection),
                        Player("P2A"),
                    ],
                });
                this.match.restoreFromState(
                    createState({
                        turn: 1,
                        currentPlayer: "P1A",
                        playerStateById: {
                            P1A: {
                                phase: "draw",
                                cardsOnHand: [createCard({ id: "C1A" })],
                            },
                            P2A: {
                                cardsInZone: [
                                    createCard({
                                        id: "C3A",
                                        type: "spaceShip",
                                        commonId: DisturbingSensor.CommonId,
                                    }),
                                ],
                            },
                        },
                    })
                );

                this.match.nextPhase("P1A", { currentPhase: "draw" });
            },
            "should NOT emit requirement to player"() {
                refute.calledWith(
                    this.firstPlayerConnection.stateChanged,
                    sinon.match({
                        requirements: sinon.match([
                            sinon.match({ type: "discardCard", count: 1 }),
                        ]),
                    })
                );
            },
        },
    },
};

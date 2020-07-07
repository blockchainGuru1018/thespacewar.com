const {
    bocha: { assert, refute, sinon },
    catchError,
    createCard,
    Player,
    createMatch,
    FakeConnection2,
    createState,
} = require("./shared.js");

module.exports = {
    "when in draw phase and with an empty deck and must draw 1 more card, can pass draw phase": {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
            const players = [
                Player("P1A", this.firstPlayerConnection),
                Player("P2A", this.secondPlayerConnection),
            ];
            this.match = createMatch({ players });
            this.match.restoreFromState(
                createState({
                    playerStateById: {
                        P1A: {
                            phase: "draw",
                            stationCards: [
                                { place: "draw", card: createCard() },
                            ],
                            cardsInDeck: [],
                        },
                    },
                })
            );

            this.match.passDrawPhase("P1A");
        },
        "should be in the action phase"() {
            assert.calledWith(
                this.firstPlayerConnection.stateChanged,
                sinon.match({
                    phase: "action",
                })
            );
        },
    },
    "when in draw phase and with and the deck is NOT empty and must draw 1 more card, can NOT pass draw phase": {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
            const players = [
                Player("P1A", this.firstPlayerConnection),
                Player("P2A", this.secondPlayerConnection),
            ];
            this.match = createMatch({ players });
            this.match.restoreFromState(
                createState({
                    playerStateById: {
                        P1A: {
                            phase: "draw",
                            stationCards: [
                                { place: "draw", card: createCard() },
                            ],
                            cardsInDeck: [createCard()],
                        },
                    },
                })
            );

            this.error = catchError(() => this.match.passDrawPhase("P1A"));
        },
        "should NOT change state"() {
            refute.called(this.firstPlayerConnection.stateChanged);
        },
        "should throw"() {
            assert(this.error);
            assert.equals(this.error.message, "Cannot pass draw phase");
        },
    },
    "when in action phase can NOT pass draw phase": {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
            const players = [
                Player("P1A", this.firstPlayerConnection),
                Player("P2A", this.secondPlayerConnection),
            ];
            this.match = createMatch({ players });
            this.match.restoreFromState(
                createState({
                    playerStateById: {
                        P1A: {
                            phase: "action",
                            stationCards: [
                                { place: "draw", card: createCard() },
                            ],
                            cardsInDeck: [],
                        },
                    },
                })
            );

            this.error = catchError(() => this.match.passDrawPhase("P1A"));
        },
        "should NOT change state"() {
            refute.called(this.firstPlayerConnection.stateChanged);
        },
        "should throw"() {
            assert(this.error);
            assert.equals(this.error.message, "Cannot pass draw phase");
        },
    },
};

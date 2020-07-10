const {
  bocha: { assert },
  createCard,
  FakeConnection2,
  catchError,
  createState,
  createMatch,
  Player,
} = require("./shared.js");

module.exports = {
  "when has 8 cards entering discard phase of first turn and leaves without discarding should throw error": function () {
    this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
    this.secondPlayerConnection = FakeConnection2(["stateChanged"]);
    this.match = createMatch({ players: [Player("P1A")] });
    this.match.restoreFromState(
      createState({
        playerStateById: {
          P1A: {
            phase: "discard",
            stationCards: [
              { place: "action", card: createCard({ id: "S1A" }) },
            ],
            cardsOnHand: [createCard({ id: "C1A" })],
          },
        },
      })
    );

    const error = catchError(() =>
      this.match.nextPhase("P1A", { currentPhase: "discard" })
    );

    assert.equals(
      error.message,
      "Cannot leave the discard phase without discarding enough cards"
    );
    assert.equals(error.type, "CheatDetected");
  },
};

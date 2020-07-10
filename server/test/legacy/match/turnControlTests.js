const {
  bocha: { stub, assert, refute, sinon },
  createCard,
  Player,
  createMatch,
  FakeConnection2,
  catchError,
  createState,
} = require("./shared.js");
const TargetMissed = require("../../../../shared/card/TargetMissed.js");
const PutDownCardEvent = require("../../../../shared/PutDownCardEvent.js");
const MoveCardEvent = require("../../../../shared/event/MoveCardEvent.js");
const StateAsserter = require("../../testUtils/StateAsserter.js");

module.exports = {
  "when player has taken control of the turn and put down a card costing 0": {
    async setUp() {
      this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
      this.match = createMatch({
        players: [Player("P1A", this.firstPlayerConnection)],
      });
      this.match.restoreFromState(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              turn: 1,
              phase: "wait",
              cardsOnHand: [
                createCard({ id: "C1A", type: "spaceShip", cost: 0 }),
              ],
            },
          },
        })
      );

      this.match.putDownCard("P1A", { cardId: "C1A", location: "zone" });
    },
    "should put down card"() {
      this.match.refresh("P1A");
      assert.calledWith(
        this.firstPlayerConnection.stateChanged,
        sinon.match({
          cardsInZone: [sinon.match({ id: "C1A" })],
        })
      );
    },
  },
  "when player has NOT taken control of the turn and put down a card costing 0": {
    async setUp() {
      this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
      this.match = createMatch({
        players: [Player("P1A", this.firstPlayerConnection)],
      });
      this.match.restoreFromState(
        createState({
          currentPlayer: "P2A",
          playerStateById: {
            P1A: {
              turn: 1,
              phase: "wait",
              cardsOnHand: [
                createCard({ id: "C1A", type: "spaceShip", cost: 0 }),
              ],
            },
          },
        })
      );

      this.error = catchError(() =>
        this.match.putDownCard("P1A", { cardId: "C1A", location: "zone" })
      );
    },
    "should throw error"() {
      assert(this.error);
      assert(this.error.message, "Cannot put down card");
    },
    "should NOT put down card"() {
      this.match.refresh("P1A");
      assert.calledWith(
        this.firstPlayerConnection.stateChanged,
        sinon.match({
          cardsOnHand: [sinon.match({ id: "C1A" })],
          cardsInZone: [],
        })
      );
    },
  },
  "when player has NOT taken control of the turn and put down a station card": {
    async setUp() {
      this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
      this.match = createMatch({
        players: [Player("P1A", this.firstPlayerConnection)],
      });
      this.match.restoreFromState(
        createState({
          currentPlayer: "P2A",
          playerStateById: {
            P1A: {
              turn: 1,
              phase: "wait",
              cardsOnHand: [
                createCard({ id: "C1A", type: "spaceShip", cost: 0 }),
              ],
              stationCards: [{ card: createCard({ id: "C2A" }) }],
            },
          },
        })
      );

      this.error = catchError(() =>
        this.match.putDownCard("P1A", {
          cardId: "C1A",
          location: "station-action",
        })
      );
    },
    "should throw error"() {
      assert(this.error);
      assert(this.error.message, "Cannot put down card");
    },
    "should NOT put down card"() {
      this.match.refresh("P1A");
      assert.calledWith(
        this.firstPlayerConnection.stateChanged,
        sinon.match({
          cardsOnHand: [sinon.match({ id: "C1A" })],
          stationCards: [sinon.match({ id: "C2A" })],
        })
      );
    },
  },
  "--- using state asserter ---": {
    setUp() {
      const firstPlayerConnection = FakeConnection2(["stateChanged"]);
      const secondPlayerConnection = FakeConnection2(["stateChanged"]);
      const players = [
        Player("P1A", firstPlayerConnection),
        Player("P2A", secondPlayerConnection),
      ];
      this.match = createMatch({ players });
      this.firstPlayerAsserter = StateAsserter(
        this.match,
        firstPlayerConnection,
        "P1A"
      );
      this.secondPlayerAsserter = StateAsserter(
        this.match,
        secondPlayerConnection,
        "P2A"
      );
    },
    "when flipping the opponent last station card and opponent has target missed on hand": {
      async setUp() {
        this.match.restoreFromState(
          createState({
            turn: 3,
            currentPlayer: "P1A",
            playerStateById: {
              P1A: {
                phase: "attack",
                cardsInOpponentZone: [
                  createCard({ id: "C1A", type: "spaceShip", attack: 1 }),
                ],
                events: [
                  PutDownCardEvent({
                    cardId: "C1A",
                    turn: 1,
                    location: "zone",
                  }),
                  MoveCardEvent({ cardId: "C1A", turn: 2 }),
                ],
                stationCards: [stationCard()],
              },
              P2A: {
                stationCards: [stationCard("S1A", "action")],
                cardsOnHand: [
                  createCard({
                    id: "C2A",
                    commonId: TargetMissed.CommonId,
                    type: "event",
                  }),
                ],
              },
            },
          })
        );

        this.match.attackStationCard("P1A", {
          attackerCardId: "C1A",
          targetStationCardIds: ["S1A"],
        });
      },
      "should trigger last stand"() {
        this.firstPlayerAsserter.hasStartedLastStandForPlayer("P2A");
        this.secondPlayerAsserter.hasStartedLastStandForPlayer("P2A");
      },
      "should give control of turn to opponent"() {
        this.firstPlayerAsserter.playerHasControlOfTurn("P2A");
        this.secondPlayerAsserter.playerHasControlOfTurn("P2A");
      },
    },
  },
};

function stationCard(id = "some_id", place = "draw") {
  return {
    place,
    card: createCard({ id }),
  };
}

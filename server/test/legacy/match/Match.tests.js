const {
  bocha: { sinon, assert },
  Player,
  createMatch,
  createState,
  FakeConnection2,
} = require("./shared.js");
const StateAsserter = require("../../testUtils/StateAsserter.js");
const MatchMode = require("../../../../shared/match/MatchMode.js");

module.exports = {
  "draw card:": require("./drawCardTests.js"),
  "pass draw phase:": require("./passDrawPhaseTests.js"),
  "putDownCard:": require("./putDownCardTests.js"),
  "discardCard:": require("./discardCardTests.js"),
  "nextPhase:": require("./nextPhaseTests.js"),
  "nextPhase action phase:": require("./nextPhaseActionPhaseTests.js"),
  "discard phase": require("./discardPhaseTests.js"),
  "attack phase:": require("./attackPhaseTests.js"),
  "duration card:": require("./durationCardTests.js"),
  "damage station cards": require("./damageStationCardsTests.js"),
  overwork: require("./overworkTests.js"),
  putDownExtraStationCards: require("./putDownExtraStationCardsTests.js"),
  moveStationCard: require("./moveStationCardTests.js"),
  turnControlTests: require("./turnControlTests.js"),
  counterTests: require("./counterTests.js"),
  findCardTests: require("./findCardTests.js"),
  "when first player retreats from match should emit updated game state with retreated player id": {
    setUp() {
      this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
      this.secondPlayerConnection = FakeConnection2(["stateChanged"]);
      this.match = createMatch({
        players: [
          Player("P1A", this.firstPlayerConnection),
          Player("P2A", this.secondPlayerConnection),
        ],
      });
      this.match.restoreFromState(createState({}));

      this.match.retreat("P1A");
    },
    "when first player restore state should say opponent retreated"() {
      this.match.refresh("P1A");
      assert.calledWith(
        this.firstPlayerConnection.stateChanged,
        sinon.match({
          retreatedPlayerId: "P1A",
          ended: true,
        })
      );
    },
    "when second player restore state should say opponent retreated"() {
      this.match.refresh("P2A");
      assert.calledWith(
        this.secondPlayerConnection.stateChanged,
        sinon.match({
          retreatedPlayerId: "P1A",
          ended: true,
        })
      );
    },
    "when ask match if has ended should be true"() {
      assert(this.match.hasEnded());
    },
  },
  'when match mode is not "game" and player refresh page and has no station cards': {
    setUp() {
      this.firstPlayerConnection = FakeConnection2(["stateChanged"]);
      this.match = createMatch({
        players: [Player("P1A", this.firstPlayerConnection), Player("P2A")],
      });
      this.firstPlayerAsserter = StateAsserter(
        this.match,
        this.firstPlayerConnection,
        "P1A"
      );
      this.match.restoreFromState(
        createState({
          mode: MatchMode.chooseStartingPlayer,
          turn: 1,
          playerStateById: {
            P1A: {
              phase: "start",
              stationCards: [],
            },
            P2A: {
              phase: "start",
              stationCards: [],
            },
          },
        })
      );
    },
    "should NOT retreat any player"() {
      this.firstPlayerAsserter.send();
      this.firstPlayerAsserter.noPlayerIsDefeated();
    },
    "should NOT end game"() {
      this.firstPlayerAsserter.send();
      this.firstPlayerAsserter.gameHasNotEnded();
    },
  },
};

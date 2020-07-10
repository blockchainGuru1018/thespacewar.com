const { assert, fakeClock } = require("../testUtils/bocha-jest/bocha");
const createCard = require("../testUtils/FakeCardDataAssembler.js").createCard;
const TestHelper = require("../fakeFactories/TestHelper.js");
const createState = require("../fakeFactories/createState.js");
const AttackEvent = require("../../event/AttackEvent.js");
const GameConfig = require("../../match/GameConfig.js");

module.exports = {
  tearDown() {
    this.clock && this.clock.restore();
  },
  "when has 2 attacks that happened within 5s before took control": {
    setUp() {
      this.clock = fakeClock("2000-01-01T00:00:06.000Z");
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              cardsInZone: [createCard({ id: "C1A" })],
              events: [
                {
                  type: "takeControlOfOpponentsTurn",
                  created: Date.parse("2000-01-01T00:00:06.000Z"),
                },
              ],
            },
            P2A: {
              cardsInZone: [createCard({ id: "C2A", type: "spaceShip" })],
              events: [
                Attack("C2A", "C1A", "2000-01-01T00:00:06.000Z"),
                Attack("C2A", "C1A", "2000-01-01T00:00:01.000Z"),
                Attack("C2A", "C1A", "2000-01-01T00:00:00.000Z"),
              ],
            },
          },
        }),
        {
          gameConfig: GameConfig({
            timeToCounter: 5000,
          }),
        }
      );
      const queryAttacks = testHelper.queryAttacks("P1A");

      this.attackEvents = queryAttacks.canBeCountered();
    },
    "should yield 2 events"() {
      assert.equals(this.attackEvents.length, 2);
    },
    "the second event should be the latest"() {
      const secondEvent = this.attackEvents[1];
      assert.equals(
        new Date(secondEvent.created),
        new Date(Date.parse("2000-01-01T00:00:06.000Z"))
      );
    },
    "the first event should be the earliest"() {
      const firstEvent = this.attackEvents[0];
      assert.equals(firstEvent.created, Date.parse("2000-01-01T00:00:01.000Z"));
    },
  },
  "when has 2 attacks that happened within 5s before took control, but has previously taken and released control": {
    setUp() {
      this.clock = fakeClock("2000-01-01T00:00:06.000Z");
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              cardsInZone: [createCard({ id: "C1A" })],
              events: [
                {
                  type: "takeControlOfOpponentsTurn",
                  created: Date.parse("2000-01-01T00:00:04.000Z"),
                },
                {
                  type: "releaseControlOfOpponentsTurn",
                  created: Date.parse("2000-01-01T00:00:05.000Z"),
                },
                {
                  type: "takeControlOfOpponentsTurn",
                  created: Date.parse("2000-01-01T00:00:06.000Z"),
                },
              ],
            },
            P2A: {
              cardsInZone: [createCard({ id: "C2A", type: "spaceShip" })],
              events: [
                Attack("C2A", "C1A", "2000-01-01T00:00:06.000Z"),
                Attack("C2A", "C1A", "2000-01-01T00:00:01.000Z"),
                Attack("C2A", "C1A", "2000-01-01T00:00:00.000Z"),
              ],
            },
          },
        }),
        {
          gameConfig: GameConfig({
            timeToCounter: 5000,
          }),
        }
      );
      const queryAttacks = testHelper.queryAttacks("P1A");

      this.attackEvents = queryAttacks.canBeCountered();
    },
    "should yield 2 events"() {
      assert.equals(this.attackEvents.length, 2);
    },
    "the second event should be the latest"() {
      assert.equals(
        this.attackEvents[1].created,
        Date.parse("2000-01-01T00:00:06.000Z")
      );
    },
    "the first event should be the earliest"() {
      assert.equals(
        this.attackEvents[0].created,
        Date.parse("2000-01-01T00:00:01.000Z")
      );
    },
  },
  "when has 1 putDownCard event that happened within 5s before took control": {
    setUp() {
      this.clock = fakeClock("2000-01-01T00:00:06.000Z");
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              cardsInZone: [createCard({ id: "C1A" })],
              events: [
                {
                  type: "takeControlOfOpponentsTurn",
                  created: Date.parse("2000-01-01T00:00:06.000Z"),
                },
              ],
            },
            P2A: {
              cardsInZone: [createCard({ id: "C2A", type: "spaceShip" })],
              events: [
                {
                  type: "putDownCard",
                  created: Date.parse("2000-01-01T00:00:01.000Z"),
                },
              ],
            },
          },
        })
      );
      const queryAttacks = testHelper.queryAttacks("P1A");

      this.attackEvents = queryAttacks.canBeCountered();
    },
    "should yield 0 events"() {
      assert.equals(this.attackEvents.length, 0);
    },
  },
  "when has 1 _countered_ attack event that happened within 5s before took control": {
    setUp() {
      this.clock = fakeClock("2000-01-01T00:00:06.000Z");
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              cardsInZone: [createCard({ id: "C1A" })],
              events: [
                {
                  type: "takeControlOfOpponentsTurn",
                  created: Date.parse("2000-01-01T00:00:06.000Z"),
                },
              ],
            },
            P2A: {
              cardsInZone: [createCard({ id: "C2A", type: "spaceShip" })],
              events: [
                AttackEvent.forTest({
                  attackerCardId: "C2A",
                  defenderCardId: "C1A",
                  countered: true,
                  created: Date.parse("2000-01-01T00:00:01.000Z"),
                }),
              ],
            },
          },
        })
      );
      const queryAttacks = testHelper.queryAttacks("P1A");

      this.attackEvents = queryAttacks.canBeCountered();
    },
    "should yield 0 events"() {
      assert.equals(this.attackEvents.length, 0);
    },
  },
  "when has 1 attack event from Missile that happened within 5s before took control": {
    setUp() {
      this.clock = fakeClock("2000-01-01T00:00:06.000Z");
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              cardsInZone: [createCard({ id: "C1A" })],
              events: [
                {
                  type: "takeControlOfOpponentsTurn",
                  created: Date.parse("2000-01-01T00:00:06.000Z"),
                },
              ],
            },
            P2A: {
              cardsInZone: [createCard({ id: "C2A", type: "missile" })],
              events: [
                AttackEvent.forTest({
                  attackerCardId: "C2A",
                  defenderCardId: "C1A",
                  created: Date.parse("2000-01-01T00:00:01.000Z"),
                }),
              ],
            },
          },
        })
      );
      const queryAttacks = testHelper.queryAttacks("P1A");

      this.attackEvents = queryAttacks.canBeCountered();
    },
    "should yield 0 events"() {
      assert.equals(this.attackEvents.length, 0);
    },
  },
  "when has 1 attack event from Defense card that happened within 5s before took control": {
    setUp() {
      this.clock = fakeClock("2000-01-01T00:00:06.000Z");
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              cardsInZone: [createCard({ id: "C1A" })],
              events: [
                {
                  type: "takeControlOfOpponentsTurn",
                  created: Date.parse("2000-01-01T00:00:06.000Z"),
                },
              ],
            },
            P2A: {
              cardsInZone: [createCard({ id: "C2A", type: "defense" })],
              events: [
                AttackEvent.forTest({
                  attackerCardId: "C2A",
                  defenderCardId: "C1A",
                  created: Date.parse("2000-01-01T00:00:01.000Z"),
                }),
              ],
            },
          },
        })
      );
      const queryAttacks = testHelper.queryAttacks("P1A");

      this.attackEvents = queryAttacks.canBeCountered();
    },
    "should yield 0 events"() {
      assert.equals(this.attackEvents.length, 0);
    },
  },
  "when was attacked 1 second ago but has NOT taken control of the turn": {
    setUp() {
      this.clock = fakeClock("2000-01-01T00:00:01.000Z");
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P2A",
          playerStateById: {
            P1A: {
              cardsInZone: [createCard({ id: "C1A" })],
            },
            P2A: {
              cardsInZone: [createCard({ id: "C2A", type: "spaceShip" })],
              events: [Attack("C2A", "C1A", "2000-01-01T00:00:00.000Z")],
            },
          },
        })
      );
      const queryAttacks = testHelper.queryAttacks("P1A");

      this.attackEvents = queryAttacks.canBeCountered();
    },
    "should yield 0 events"() {
      assert.equals(this.attackEvents.length, 0);
    },
  },
};

function Attack(attackerCardId, defenderCardId, isoTimestamp) {
  return AttackEvent.forTest({
    created: Date.parse(isoTimestamp),
    attackerCardId,
    defenderCardId,
  });
}

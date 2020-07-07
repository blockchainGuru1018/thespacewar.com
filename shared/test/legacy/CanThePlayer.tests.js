const { refute, assert } = require("../testUtils/bocha-jest/bocha");
const FakeCardDataAssembler = require("../testUtils/FakeCardDataAssembler.js");
const createCardData = FakeCardDataAssembler.createCard;
const BaseCard = require("../../card/BaseCard.js");
const CanThePlayer = require("../../match/CanThePlayer.js");
const TestHelper = require("../fakeFactories/TestHelper.js");
const createState = require("../fakeFactories/createState.js");

const { createCard } = require("../testUtils/shared.js");

module.exports = {
  "when card is of type spaceShip": {
    setUp() {
      this.card = createCard(BaseCard, {
        card: { type: "spaceShip" },
      });
      this.canThePlayer = new CanThePlayer();
    },
    "card can move"() {
      assert(this.canThePlayer.moveThisCard(this.card));
    },
    "card can attack"() {
      assert(this.canThePlayer.attackWithThisCard(this.card));
    },
  },
  'when card is of type missile and opponent has "Disturbing sensor" in play': {
    setUp() {
      this.card = createCard(BaseCard, {
        card: { type: "missile" },
      });
      const disturbingSensor = {
        preventsOpponentMissilesFromMoving: true,
        preventsOpponentMissilesFromAttacking: true,
      };
      this.canThePlayer = new CanThePlayer({
        opponentStateService: {
          hasMatchingCardInSomeZone: (matcher) => matcher(disturbingSensor),
        },
      });
    },
    "card can NOT move"() {
      refute(this.canThePlayer.moveThisCard(this.card));
    },
    "card can NOT attack"() {
      refute(this.canThePlayer.attackWithThisCard(this.card));
    },
  },
  "counterCard:": {
    "card does not exist"() {
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              phase: "wait",
            },
            P2A: {
              phase: "action",
              cardsInZone: [],
            },
          },
        })
      );
      const canThePlayer = testHelper.canThePlayer("P1A");

      const canCounterCard = canThePlayer.counterCard({ id: "C1A" });

      refute(canCounterCard);
    },
    "took control too late"() {
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              phase: "wait",
            },
            P2A: {
              phase: "action",
              cardsInZone: [{ id: "C1A" }],
            },
          },
        })
      );
      testHelper.stub("queryEvents", "P1A", {
        lastTookControlWithinTimeFrameSincePutDownCard: () => false,
        wasOpponentCardAtLatestPutDownInHomeZone: () => true,
        wasOpponentEventCardAtLatestPutDownInHomeZoneAndDiscardedAtTheSameTurn: () =>
          false,
        wasOpponentCardAtLatestPutDownAsExtraStationCard: () => false,
      });
      const canThePlayer = testHelper.canThePlayer("P1A");

      const canCounterCard = canThePlayer.counterCard({ id: "C1A" });

      refute(canCounterCard);
    },
    "card was at the latest put down as station card"() {
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              phase: "wait",
            },
            P2A: {
              phase: "action",
              cardsInZone: [],
              stationCards: [
                {
                  card: createCardData({ id: "C1A" }),
                  place: "action",
                },
              ],
            },
          },
        })
      );
      testHelper.stub("queryEvents", "P1A", {
        lastTookControlWithinTimeFrameSincePutDownCard: () => true,
        wasOpponentCardAtLatestPutDownInHomeZone: () => false,
        wasOpponentEventCardAtLatestPutDownInHomeZoneAndDiscardedAtTheSameTurn: () =>
          false,
        wasOpponentCardAtLatestPutDownAsExtraStationCard: () => false,
      });
      const canThePlayer = testHelper.canThePlayer("P1A");

      const canCounterCard = canThePlayer.counterCard({ id: "C1A" });

      refute(canCounterCard);
    },
    "card was at the latest put down in zone"() {
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              phase: "wait",
            },
            P2A: {
              phase: "action",
              cardsInZone: [createCardData({ id: "C1A" })],
            },
          },
        })
      );
      testHelper.stub("queryEvents", "P1A", {
        lastTookControlWithinTimeFrameSincePutDownCard: () => true,
        wasOpponentCardAtLatestPutDownInHomeZone: () => true,
        wasOpponentEventCardAtLatestPutDownInHomeZoneAndDiscardedAtTheSameTurn: () =>
          false,
        wasOpponentCardAtLatestPutDownAsExtraStationCard: () => false,
      });
      const canThePlayer = testHelper.canThePlayer("P1A");

      const canCounterCard = canThePlayer.counterCard({ id: "C1A" });

      assert(canCounterCard);
    },
    "event card was at the latest both put down and discarded in the same turn"() {
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              phase: "wait",
              events: [
                {
                  type: "takeControlOfOpponentsTurn",
                  created: 0,
                },
              ],
            },
            P2A: {
              phase: "action",
              discardedCards: [createCardData({ id: "C1A", type: "event" })],
              events: [
                {
                  type: "putDownCard",
                  turn: 1,
                  cardId: "C1A",
                  location: "zone",
                  created: 0,
                },
                { type: "discardCard", turn: 1, cardId: "C1A" },
              ],
            },
          },
        })
      );
      const canThePlayer = testHelper.canThePlayer("P1A");

      const canCounterCard = canThePlayer.counterCard({ id: "C1A" });

      assert(canCounterCard);
    },
    "card was at the latest put down as extra station card"() {
      const testHelper = TestHelper(
        createState({
          currentPlayer: "P1A",
          playerStateById: {
            P1A: {
              phase: "wait",
            },
            P2A: {
              phase: "action",
              cardsInZone: [createCardData({ id: "C1A" })],
            },
          },
        })
      );
      testHelper.stub("queryEvents", "P1A", {
        lastTookControlWithinTimeFrameSincePutDownCard: () => true,
        wasOpponentCardAtLatestPutDownInHomeZone: () => false,
        wasOpponentEventCardAtLatestPutDownInHomeZoneAndDiscardedAtTheSameTurn: () =>
          false,
        wasOpponentCardAtLatestPutDownAsExtraStationCard: () => true,
      });
      const canThePlayer = testHelper.canThePlayer("P1A");

      const canCounterCard = canThePlayer.counterCard({ id: "C1A" });

      assert(canCounterCard);
    },
  },
};

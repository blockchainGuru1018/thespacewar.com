const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");

const lastEventTimestamp = new Date("2020-06-24T11:00:00.135Z");
fakeCurrentDate(new Date("2020-06-24T11:05:00.135Z"));

describe("Player timeout", () => {
  it("should force to retreat in a period of time if player disconnect on his turn", () => {
    const {
      match,
      firstPlayerConnection,
      firstPlayerAsserter,
    } = setupIntegrationTest({
      playerStateById: {
        P1A: {
          phase: "action",
          events: [{ created: lastEventTimestamp }],
        },
        P2A: {
          phase: "wait",
        },
      },
    });
    firstPlayerConnection.disconnected = true;
    firstPlayerConnection.connected = false;

    match.checkLastTimeOfInactivityForPlayer("P2A");
    firstPlayerAsserter.playerIsDefeated("P1A");
  });

  it("should force to retreat if player last event was before max inactivity period", () => {
    const { match, firstPlayerAsserter } = setupIntegrationTest({
      playerStateById: {
        P1A: {
          phase: "action",
          events: [{ created: lastEventTimestamp }],
        },
        P2A: {
          phase: "wait",
        },
      },
    });
    match.checkLastTimeOfInactivityForPlayer("P1A");
    firstPlayerAsserter.playerIsDefeated("P1A");
  });

  it("should force to retreat using the player vs bot inactivity period", () => {
    const { match, firstPlayerAsserter } = setupIntegrationTest(
      {
        playerStateById: {
          P1A: {
            phase: "action",
            events: [{ created: new Date("2020-06-24T10:55:00.135Z") }],
          },
          BOT: {
            phase: "wait",
          },
        },
      },
      { playerId: "P1A", opponentId: "BOT" }
    );
    match.checkLastTimeOfInactivityForPlayer("P1A");
    firstPlayerAsserter.playerIsDefeated("P1A");
  });

  it(
    "should not force retreat if next turn the last event of the player its more " +
      "than the inactivity period because of the other player its delayed time",
    () => {
      const { match } = setupIntegrationTest({
        playerStateById: {
          P1A: {
            phase: "attack",
            events: [{ created: lastEventTimestamp }],
          },
          P2A: {
            phase: "wait",
            events: [{ created: lastEventTimestamp }],
          },
        },
      });

      match.nextPhase("P1A", { currentPhase: "attack" });
      match.checkLastTimeOfInactivityForPlayer("P2A");

      expect(match.hasEnded()).toBeFalsy();
    }
  );
});

function fakeCurrentDate(fakeDate) {
  global.Date = class extends Date {
    constructor(date) {
      if (date) {
        return super(date);
      }
      return fakeDate;
    }
  };
}

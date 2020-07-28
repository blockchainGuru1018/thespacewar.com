const FindDronesForZuuls = require("../match/commander/FindDronesForZuuls");
const Commander = require("../match/commander/Commander");

describe("Find drones for Zuuls", () => {
  it("should trigger on first action phase only", () => {
    const test = new FindDronesForZuuls({
      playerStateService: {
        getCurrentCommander: () => Commander.Zuuls,
        getEvents: () => [],
      },
      playerPhase: {
        isAction: () => true,
      },
      matchService: {
        getTurn: () => 1,
      },
    });

    expect(test.canIssueFindDronesForZuuls()).toBeTruthy();
  });
  it("should  Be able to trigger it only one time", () => {
    const test = new FindDronesForZuuls({
      playerStateService: {
        getCurrentCommander: () => Commander.Zuuls,
        getEvents: () => [{ type: "zuulsFindDrones" }],
      },
      playerPhase: {
        isAction: () => true,
      },
      matchService: {
        getTurn: () => 1,
      },
    });

    expect(test.canIssueFindDronesForZuuls()).toBeFalsy();
  });
});

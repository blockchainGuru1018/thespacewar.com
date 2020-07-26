const NaaloxDormantEffect = require("../match/commander/NaaloxDormantEffect");
const Drone = require("../card/Drone");
const Commander = require("../match/commander/Commander");

describe("Naalox Repair Station", () => {
  it("should no be able if not using  Naalox", () => {
    const naaloxDormantEffect = new NaaloxDormantEffect({
      playerStateService: {
        getFlippedStationCards: () => [{}],
        getCurrentCommander: () => Commander.Zuuls,
      },
      playerPhase: {
        isAction: () => true,
      },
    });
    expect(naaloxDormantEffect.canIssueRepairStation()).toBeFalsy();
  });

  it("should no be able if cant afford it", () => {
    const naaloxDormantEffect = new NaaloxDormantEffect({
      playerStateService: {
        getFlippedStationCards: () => [{}],
        getCurrentCommander: () => Commander.Naalox,
      },
      playerPhase: {
        isAction: () => true,
      },
      playerActionPointsCalculator: {
        calculate: () => 1,
      },
    });
    expect(naaloxDormantEffect.canIssueRepairStation()).toBeFalsy();
  });

  it("should no be able if already used any naalox dormat effect  2 times in same turn", () => {
    const naaloxDormantEffect = new NaaloxDormantEffect({
      playerStateService: {
        getFlippedStationCards: () => [{}],
        getCurrentCommander: () => Commander.Naalox,
        getEvents: () => [
          { type: "naaloxDormantEffect", turn: 1 },
          { type: "naaloxDormantEffect", turn: 1 },
        ],
      },
      matchService: {
        getTurn: () => 1,
      },
      playerActionPointsCalculator: {
        calculate: () => 4,
      },
      playerPhase: {
        isAction: () => true,
      },
    });
    expect(naaloxDormantEffect.canIssueRepairStation()).toBeFalsy();
  });

  it("should no be able if not flipped cards and not discarded Drones", () => {
    const naaloxDormantEffect = new NaaloxDormantEffect({
      playerStateService: {
        getCurrentCommander: () => Commander.Naalox,
        getEvents: () => [{ type: "naaloxDormantEffect", turn: 1 }],
        getFlippedStationCards: () => [],
      },
      matchService: {
        getTurn: () => 1,
      },
      playerActionPointsCalculator: {
        calculate: () => 4,
      },
      playerPhase: {
        isAction: () => true,
      },
    });
    expect(naaloxDormantEffect.canIssueRepairStation()).toBeFalsy();
  });

  it("should be able to repair station card", () => {
    const naaloxDormantEffect = new NaaloxDormantEffect({
      playerStateService: {
        getCurrentCommander: () => Commander.Naalox,
        getEvents: () => [{ type: "naaloxDormantEffect", turn: 1 }],
        getFlippedStationCards: () => [{}],
      },
      matchService: {
        getTurn: () => 1,
      },
      playerActionPointsCalculator: {
        calculate: () => 4,
      },
      playerPhase: {
        isAction: () => true,
      },
    });
    expect(naaloxDormantEffect.canIssueRepairStation()).toBeTruthy();
  });
});

describe("Naalox Revive Drone", () => {
  it("should no be able if not using  Naalox", () => {
    const naaloxDormantEffect = new NaaloxDormantEffect({
      playerStateService: {
        getFlippedStationCards: () => [{}],
        getCurrentCommander: () => Commander.Zuuls,
        getDiscardedCards: () => [{ commonId: Drone.CommonId }],
      },
      playerPhase: {
        isAction: () => true,
      },
    });
    expect(naaloxDormantEffect.canIssueReviveDrone()).toBeFalsy();
  });

  it("should no be able if cant afford it", () => {
    const naaloxDormantEffect = new NaaloxDormantEffect({
      playerStateService: {
        getFlippedStationCards: () => [{}],
        getCurrentCommander: () => Commander.Naalox,
        getDiscardedCards: () => [{ commonId: Drone.CommonId }],
      },
      playerPhase: {
        isAction: () => true,
      },
      playerActionPointsCalculator: {
        calculate: () => 1,
      },
    });
    expect(naaloxDormantEffect.canIssueReviveDrone()).toBeFalsy();
  });

  it("should no be able if already used any naalox dormat effect  2 times in same turn", () => {
    const naaloxDormantEffect = new NaaloxDormantEffect({
      playerStateService: {
        getFlippedStationCards: () => [{}],
        getCurrentCommander: () => Commander.Naalox,
        getEvents: () => [
          { type: "naaloxDormantEffect", turn: 1 },
          { type: "naaloxDormantEffect", turn: 1 },
        ],
        getDiscardedCards: () => [{ commonId: Drone.CommonId }],
      },
      matchService: {
        getTurn: () => 1,
      },
      playerActionPointsCalculator: {
        calculate: () => 4,
      },
      playerPhase: {
        isAction: () => true,
      },
    });
    expect(naaloxDormantEffect.canIssueReviveDrone()).toBeFalsy();
  });

  it("should no be able if not Drone discarded", () => {
    const naaloxDormantEffect = new NaaloxDormantEffect({
      playerStateService: {
        getCurrentCommander: () => Commander.Naalox,
        getEvents: () => [{ type: "naaloxDormantEffect", turn: 1 }],
        getFlippedStationCards: () => [],
        getDiscardedCards: () => [],
      },
      playerPhase: {
        isAction: () => true,
      },
      matchService: {
        getTurn: () => 1,
      },
      playerActionPointsCalculator: {
        calculate: () => 4,
      },
    });
    expect(naaloxDormantEffect.canIssueReviveDrone()).toBeFalsy();
  });

  it("should be able to revive Drone", () => {
    const naaloxDormantEffect = new NaaloxDormantEffect({
      playerStateService: {
        getCurrentCommander: () => Commander.Naalox,
        getEvents: () => [{ type: "naaloxDormantEffect", turn: 1 }],
        getFlippedStationCards: () => [{}],
        getDiscardedCards: () => [{ commonId: Drone.CommonId }],
      },
      playerPhase: {
        isAction: () => true,
      },
      matchService: {
        getTurn: () => 1,
      },
      playerActionPointsCalculator: {
        calculate: () => 4,
      },
    });
    expect(naaloxDormantEffect.canIssueReviveDrone()).toBeTruthy();
  });
});

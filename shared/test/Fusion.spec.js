const { createCard } = require("./testUtils/shared.js");
const Fusion = require("../card/Fusion");
const { PHASES } = require("../../shared/phases.js");

describe("Fusion should not be able to trigger dormant effect", () => {
  it("Should be not be able when its first turn", () => {
    const card = new createCard(Fusion, {
      queryEvents: {
        getTurnWhenCardWasPutDown: () => 1,
        getAttacksOnTurn: () => [1],
      },
      playerStateService: {
        getMatchingCardInSameZone: (id, matcher) =>
          [
            { id: "C1A", type: "spaceShip" },
            { id: "C2A", type: "spaceShip" },
          ].filter(matcher),
        getPhase: () => PHASES.attack,
      },
      matchService: {
        getTurn: () => 1,
      },
    });
    expect(card.canTriggerDormantEffect()).toBeFalsy();
  });
  it("Should be not be able when if its not Attack Phase", () => {
    const card = new createCard(Fusion, {
      queryEvents: {
        getTurnWhenCardWasPutDown: () => 1,
        getAttacksOnTurn: () => [1],
      },
      playerStateService: {
        getMatchingCardInSameZone: (id, matcher) =>
          [
            { id: "C1A", type: "spaceShip" },
            { id: "C2A", type: "spaceShip" },
          ].filter(matcher),
        getPhase: () => PHASES.action,
      },
      matchService: {
        getTurn: () => 1,
      },
    });
    expect(card.canTriggerDormantEffect()).toBeFalsy();
  });

  it("Should not able when already attacked", () => {
    const card = new createCard(Fusion, {
      queryEvents: {
        getTurnWhenCardWasPutDown: () => 1,
        getAttacksOnTurn: () => [1],
      },
      playerStateService: {
        getMatchingCardInSameZone: (id, matcher) =>
          [
            { id: "C1A", type: "spaceShip" },
            { id: "C2A", type: "spaceShip" },
          ].filter(matcher),
        getPhase: () => PHASES.attack,
      },
      matchService: {
        getTurn: () => 2,
      },
    });
    expect(card.canTriggerDormantEffect()).toBeFalsy();
  });

  it("Should not able when there are not 2 spaceShip in sameZone", () => {
    const card = new createCard(Fusion, {
      queryEvents: {
        getTurnWhenCardWasPutDown: () => 1,
        getAttacksOnTurn: () => [1],
      },
      playerStateService: {
        getMatchingCardInSameZone: (id, matcher) =>
          [
            { id: "C1A", type: "spaceShip" },
            { id: "C2A", type: "event" },
          ].filter(matcher),
        getPhase: () => PHASES.attack,
      },
      matchService: {
        getTurn: () => 2,
      },
    });
    expect(card.canTriggerDormantEffect()).toBeFalsy();
  });
});

describe("Fusion should be able to trigger dormant effect", () => {
  it("after first turn if have not attacked and exist 2 friendly spaceShips in the same  Zone", () => {
    const card = new createCard(Fusion, {
      queryEvents: {
        getTurnWhenCardWasPutDown: () => 1,
        getAttacksOnTurn: () => [],
      },
      playerStateService: {
        getMatchingCardInSameZone: (id, matcher) =>
          [
            { id: "C1A", type: "spaceShip" },
            { id: "C2A", type: "spaceShip" },
          ].filter(matcher),
        getPhase: () => PHASES.attack,
      },
      matchService: {
        getTurn: () => 2,
      },
    });
    expect(card.canTriggerDormantEffect()).toBeTruthy();
  });
});

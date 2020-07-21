const Fusion = require("../card/Fusion");
const { createCard } = require("./testUtils/shared.js");
describe("Fusion should not be able to trigger dormant effect", () => {
  it("Should be not be able when its first turn", () => {
    const card = new createCard(Fusion, {
      queryEvents: {
        getTimeWhenCardWasPutDownById: () => 1,
        getAttacksOnTurn: () => [1],
      },
      playerStateService: {
        hasMatchingCardInSomeZone: (id, matcher) =>
          [
            { id: "C1A", type: "spaceShip" },
            { id: "C2A", type: "spaceShip" },
          ].some(matcher),
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
        getTimeWhenCardWasPutDownById: () => 1,
        getAttacksOnTurn: () => [1],
      },
      playerStateService: {
        hasMatchingCardInSomeZone: (id, matcher) =>
          [
            { id: "C1A", type: "spaceShip" },
            { id: "C2A", type: "spaceShip" },
          ].some(matcher),
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
        getTimeWhenCardWasPutDownById: () => 1,
        getAttacksOnTurn: () => [1],
      },
      playerStateService: {
        hasMatchingCardInSomeZone: (id, matcher) =>
          [
            { id: "C1A", type: "spaceShip" },
            { id: "C2A", type: "event" },
          ].some(matcher),
      },
      matchService: {
        getTurn: () => 2,
      },
    });
    expect(card.canTriggerDormantEffect()).toBeFalsy();
  });
});

describe("Fusion should be able to trigger dormant effect", () => {
  it("after first turn if have not attacked and exist 2 friendly spaceShips in the same Home Zone", () => {
    const card = new createCard(Fusion, {
      queryEvents: {
        getTimeWhenCardWasPutDownById: () => 1,
        getAttacksOnTurn: () => [],
      },
      playerStateService: {
        hasMatchingCardInSomeZone: (id, matcher) =>
          [
            { id: "C1A", type: "spaceShip" },
            { id: "C2A", type: "spaceShip" },
          ].some(matcher),
      },
      matchService: {
        getTurn: () => 2,
      },
    });
    expect(card.canTriggerDormantEffect()).toBeTruthy();
  });
});

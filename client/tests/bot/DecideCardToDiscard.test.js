/**
 * @jest-environment node
 */
const DecideCardToDiscard = require("../../ai/DecideCardToDiscard.js");

test("should chose event card over spaceShip, if types are in that order", () => {
  const decider = createDecider({
    types: ["event", "spaceShip"],
    playerStateService: {
      getCardsOnHand: () => [
        { id: "C1A", type: "spaceShip", cost: 0 },
        { id: "C2A", type: "event", cost: 0 },
      ],
    },
  });

  const cardToDiscard = decider();

  expect(cardToDiscard).toBe("C2A");
});

test("should chose spaceShip over event card, if types are in that order", () => {
  const decider = createDecider({
    types: ["spaceShip", "event"],
    playerStateService: {
      getCardsOnHand: () => [
        { id: "C1A", type: "event", cost: 0 },
        { id: "C2A", type: "spaceShip", cost: 0 },
      ],
    },
  });

  const cardToDiscard = decider();

  expect(cardToDiscard).toBe("C2A");
});

test("should chose spaceShip if it is the only card left", () => {
  const decider = createDecider({
    types: ["event", "spaceShip"],
    playerStateService: {
      getCardsOnHand: () => [{ id: "C1A", type: "spaceShip", cost: 0 }],
    },
  });

  const cardToDiscard = decider();

  expect(cardToDiscard).toBe("C1A");
});

test("if only has spaceShips, should chose cheapest spaceShip", () => {
  const decider = createDecider({
    types: ["event", "spaceShip"],
    playerStateService: {
      getCardsOnHand: () => [
        { id: "C1A", type: "spaceShip", cost: 2 },
        { id: "C2A", type: "spaceShip", cost: 1 },
      ],
    },
  });

  const cardToDiscard = decider();

  expect(cardToDiscard).toBe("C2A");
});

test("if has NO cards should throw an error", () => {
  const decider = createDecider({
    playerStateService: {
      getCardsOnHand: () => [],
    },
  });

  let error;
  try {
    decider();
  } catch (e) {
    error = e;
  }

  expect(error).toBeDefined();
});

function createDecider(stubs = {}) {
  return DecideCardToDiscard({
    types: [],
    ...stubs,

    playerStateService: {
      createBehaviourCard: (cardData) => createFakeBehaviourCardFromCardData(cardData),
      ...stubs.playerStateService,
    },
  });
}

function createFakeBehaviourCardFromCardData(options = {}) {
  return {
    baseCost: 0,
    costWithInflation: options.cost || 0,
    ...options,
  };
}
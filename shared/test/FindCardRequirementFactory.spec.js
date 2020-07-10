const FindCardRequirementFactory = require("../match/requirement/FindCardRequirementFactory.js");
const FakeCardDataAssembler = require("./testUtils/FakeCardDataAssembler.js");
const createState = require("./fakeFactories/createState.js");
const createCard = FakeCardDataAssembler.createCard;
const TestHelper = require("./fakeFactories/TestHelper.js");

test("can create a requirement with a limit of actions points", () => {
  const testHelper = TestHelper(
    createState({
      playerStateById: {
        P1A: {
          discardedCards: [
            createCard({ id: "1", cost: 6 }),
            createCard({ id: "2", cost: 7 }),
          ],
        },
      },
    })
  );

  const findCardRequirementFactory = FindCardRequirementFactory({
    sourceFetcher: testHelper.sourceFetcher("P1A"),
    requirementSpec: {
      type: "findCard",
      count: 2,
      actionPointsLimit: 6,
      sources: ["discardPile"],
      target: "hand",
      submitOnEverySelect: true,
    },
    card: { commonId: 88 },
  });

  const result = findCardRequirementFactory.create();
  expect(result).toEqual({
    type: "findCard",
    cardGroups: [
      {
        source: "discardPile",
        cards: [{ id: "1", cost: 6 }],
      },
    ],
    cardCommonId: 88,
    count: 2,
    target: "hand",
    common: false,
    waiting: false,
    cancelable: false,
    actionPointsLimit: {
      actionPointsLeft: 6,
    },
    submitOnEverySelect: true,
  });
});

test("can create a requirement for Drones cards", () => {
  const testHelper = TestHelper(
    createState({
      playerStateById: {
        P1A: {
          discardedCards: [
            createCard({ id: "1", cost: 6, commonId: 78 }),
            createCard({ id: "2", cost: 7 }),
          ],
          cardsOnHand: [createCard({ id: "3", cost: 3, commonId: 78 })],
          cardsInDeck: [createCard({ id: "4", cost: 3, commonId: 78 })],
          stationCards: [
            stationCard("draw", "5", 78),
            stationCard("action", "6", 78),
            stationCard("handSize", "7", 78),
          ],
        },
      },
    })
  );

  const findCardRequirementFactory = FindCardRequirementFactory({
    sourceFetcher: testHelper.sourceFetcher("P1A"),
    card: { commonId: 77 },
    requirementSpec: {
      type: "findCard",
      count: 3,
      filter: {
        commonId: [78],
      },
      sources: ["discardPile"],
      target: "zone",
      submitOnEverySelect: false,
    },
  });

  const result = findCardRequirementFactory.create();
  expect(result).toEqual({
    type: "findCard",
    cardGroups: expect.arrayContaining([
      {
        source: "discardPile",
        cards: [expect.objectContaining({ id: "1", commonId: 78 })],
      },
    ]),
    cardCommonId: 77,
    count: 3,
    target: "zone",
    common: false,
    waiting: false,
    cancelable: false,
    submitOnEverySelect: false,
  });
});

function stationCard(place, id, commonId) {
  return {
    place: place,
    flipped: false,
    card: { id, commonId },
  };
}

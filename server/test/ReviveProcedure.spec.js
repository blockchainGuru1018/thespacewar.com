const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const Revive = require("../../shared/card/Revive.js");
const Drone = require("../../shared/card/Drone.js");
const TheParalyzer = require("../../shared/card/TheParalyzer.js");
const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");

describe("findCard requirement", () => {
  it("When there its just one card to select", () => {
    const { match, firstPlayerAsserter } = setupIntegrationTest({
      turn: 2,
      playerStateById: {
        P1A: {
          phase: "action",
          cardsInDeck: [createCard({ id: "C2A" }), createCard({ id: "C3A" })],
          discardedCards: [
            createCard({
              commonId: TheParalyzer.CommonId,
              id: "C4A",
              cost: 6,
            }),
          ],
          cardsOnHand: [
            createCard({
              commonId: Revive.CommonId,
              id: "C1A",
            }),
          ],
        },
        P2A: {
          cardsInZone: [createCard({ id: "C2A", type: "duration" })],
        },
      },
    });
    match.putDownCard("P1A", {
      location: "zone",
      cardId: "C1A",
    });

    match.selectCardForFindCardRequirement("P1A", {
      cardGroups: [
        {
          source: "discardPile",
          cardIds: ["C4A"],
        },
      ],
    });

    firstPlayerAsserter.refuteHasRequirement({
      actionPointsLimit: { actionPointsLeft: 6 },
      cancelable: true,
      cardCommonId: "88",
      cardGroups: [
        {
          cards: [{ commonId: "85", cost: 6, id: "C4A" }],
          source: "discardPile",
        },
      ],
      cardId: "C1A",
      common: false,
      count: 1,
      submitOnEverySelect: true,
      target: "hand",
      type: "findCard",
      waiting: false,
    });
  });

  it("When can select from 2 cards and 1 card meet the total cost it should complete the requirement if this card is selected", () => {
    const { match, firstPlayerAsserter } = setupIntegrationTest({
      turn: 2,
      playerStateById: {
        P1A: {
          phase: "action",
          cardsInDeck: [createCard({ id: "C2A" }), createCard({ id: "C3A" })],
          discardedCards: [
            createCard({
              commonId: TheParalyzer.CommonId,
              id: "C4A",
              cost: 6,
            }),
            createCard({
              commonId: Drone.CommonId,
              id: "C5A",
              cost: 1,
            }),
          ],
          cardsOnHand: [
            createCard({
              commonId: Revive.CommonId,
              id: "C1A",
            }),
          ],
        },
        P2A: {
          cardsInZone: [createCard({ id: "C2A", type: "duration" })],
        },
      },
    });
    match.putDownCard("P1A", {
      location: "zone",
      cardId: "C1A",
    });

    match.selectCardForFindCardRequirement("P1A", {
      cardGroups: [
        {
          source: "discardPile",
          cardIds: ["C4A"],
        },
      ],
    });

    firstPlayerAsserter.refuteHasRequirement({
      actionPointsLimit: { actionPointsLeft: 6 },
      cancelable: true,
      cardCommonId: "88",
      cardGroups: [
        {
          cards: [
            { commonId: "78", cost: 1, id: "C5A" },
            { commonId: "85", cost: 6, id: "C4A" },
          ],
          source: "discardPile",
        },
      ],
      cardId: "C1A",
      common: false,
      count: 2,
      submitOnEverySelect: true,
      target: "hand",
      type: "findCard",
      waiting: false,
    });
  });
});
// selectCardForFindCardRequirement, {
//   "cardGroups": [
//     {
//       "source": "discardPile",
//       "cardIds": [
//         "85:62518"
//       ]
//     }
//   ]
// })
function expectRequirementsEquals(equalsThis, playerId, testHelper) {
  const queryPlayerRequirements = testHelper.queryPlayerRequirements(playerId);
  expect(queryPlayerRequirements.all()).toStrictEqual(equalsThis);
}

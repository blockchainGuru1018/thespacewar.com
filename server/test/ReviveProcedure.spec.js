const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const Revive = require("../../shared/card/Revive.js");
const TheParalyzer = require("../../shared/card/TheParalyzer.js");
const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");

describe("findCard requirement", () => {
  it("When select draw should have requirements for drawing 2 cards", () => {
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

    // firstPlayerAsserter.hasRequirement({
    //   actionPointsLimit: { actionPointsLeft: 6 },
    //   cancelable: true,
    //   cardCommonId: "88",
    //   cardGroups: [
    //     {
    //       cards: [{ commonId: "85", cost: 6, id: "C4A" }],
    //       source: "discardPile",
    //     },
    //   ],
    //   cardId: "C1A",
    //   common: false,
    //   count: 1,
    //   submitOnEverySelect: true,
    //   target: "hand",
    //   type: "findCard",
    //   waiting: false,
    // });
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

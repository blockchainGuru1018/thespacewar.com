const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");
const createCard = FakeCardDataAssembler.createCard;
const createState = require("../../shared/test/fakeFactories/createState.js");
const TestHelper = require("../../shared/test/fakeFactories/TestHelper.js");
const {inspect} = require('util');

describe("Commander Liana Henders", () => {
  it("Should add a draw requirement if effect is called", () => {
    const { match, firstPlayerAsserter } = setupIntegrationTest({
      playerOrder: ["P1A", "P2A"],
      turn: 2,
      currentPlayer: "P1A",
      playerStateById: {
        P1A: {
          phase: "action",
          cardsOnHand: [],
          stationCards: [stationCard("S1A"), stationCard("S2A")],
        },
        P2A: {
          cardsOnHand: [
          ],
          cardsInZone: [createCard({ id: "C2A", cost: 4 })],
        },
      },
    });
    match.actionPointsForDrawExtraCard("P1A");
    console.log(inspect(match.getOwnState("P1A"),false,5,true));
    expect(match.getOwnState("P1A")).toMatchObject({
      events: [ { type: 'actionPointsForDrawExtraCard', turn: 2 } ],
      requirements: [ { type: 'drawCard', count: 1 } ],
    })
  });


  it("Should NOT add a draw requirement if has not enough action points", () => {
    const { match, firstPlayerAsserter } = setupIntegrationTest({
      playerOrder: ["P1A", "P2A"],
      turn: 2,
      currentPlayer: "P1A",
      actionPointsCalculator: {
        calculate: () => 1,
      },
      playerStateById: {
        P1A: {
          phase: "action",
          cardsOnHand: [],
          stationCards: [],
        },
        P2A: {
          cardsOnHand: [
          ],
          cardsInZone: [createCard({ id: "C2A", cost: 4 })],
        },
      },
    });
    match.actionPointsForDrawExtraCard("P1A");
    match.refresh("P1A");
    console.log(inspect(match,false,5,true));
    expect(match.getOwnState("P1A")).toMatchObject({
      events: [],
      requirements: [],
    })
  });
});
function stationCard(id = "some_id", place = "action") {
  return {
    place,
    card: createCard({ id }),
  };
}
function expectRequirementsEquals(equalsThis, playerId, testHelper) {
  const queryPlayerRequirements = testHelper.queryPlayerRequirements(playerId);
  expect(queryPlayerRequirements.all()).toStrictEqual(equalsThis);
}

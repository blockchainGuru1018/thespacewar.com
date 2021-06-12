const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");
const PutDownCardEvent = require("../../shared/PutDownCardEvent.js");
const ResourceShip = require("../../shared/card/ResourceShip.js");
const {
  createCard,
} = require("../../shared/test/testUtils/FakeCardDataAssembler.js");

describe("Playing ResourceShip", () => {
  let _match, _firstPlayerAsserter;

  beforeAll(() => {
    const { match, firstPlayerAsserter } = setupIntegrationTest({
      playerOrder: ["P1A", "P2A"],
      turn: 4,
      currentPlayer: "P1A",
      playerStateById: {
        P1A: {
          phase: "attack",
          stationCards: [stationCard("S1A"), stationCard("S2A")],
          events: [
            {
              type: "putDownCard",
              cardId: "C3A",
              turn: 3,
              cardCommonId: ResourceShip.CommonId,
              created: new Date("2020-06-24T11:15:00.135Z"),
            },
          ],
          cardsInZone: [
            createCard({ id: "C3A", commonId: ResourceShip.CommonId }),
          ],
        },
      },
    });
    _match = match;
    _firstPlayerAsserter = firstPlayerAsserter;

    _match.triggerDormantEffect("P1A", "C3A");
  });
  test("Should have 'moveCardToStationZone' requirement", () => {
    _firstPlayerAsserter.hasRequirement({
      cardCommonId: "225",
      common: false,
      type: "moveCardToStationZone",
      waiting: false,
    });
  });
});

function stationCard(id = "some_id", place = "action") {
  return {
    place,
    card: createCard({ id }),
  };
}

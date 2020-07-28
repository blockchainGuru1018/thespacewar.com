const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");
const PutDownCardEvent = require("../../shared/PutDownCardEvent.js");
const MoveCardEvent = require("../../shared/event/MoveCardEvent.js");
const Sacrifice = require("../../shared/card/Sacrifice.js");
const {
  createCard,
} = require("../../shared/test/testUtils/FakeCardDataAssembler.js");

describe("When playing Sacrifice should add a requirement with card 'in play' for both player", () => {
  it("and both has cards", () => {
    const {
      match,
      firstPlayerAsserter,
      secondPlayerAsserter,
    } = setupIntegrationTest({
      playerOrder: ["P1A", "P2A"],
      turn: 4,
      currentPlayer: "P1A",
      playerStateById: {
        P1A: {
          phase: "action",
          cardsInOpponentZone: [
            createCard({ id: "C1A", type: "spaceShip", attack: 1 }),
          ],
          stationCards: [stationCard("S1A"), stationCard("S2A")],
          events: [
            PutDownCardEvent({
              cardId: "C1A",
              turn: 1,
              location: "zone",
            }),
            MoveCardEvent({ id: "C1A", turn: 2 }),
          ],
          cardsOnHand: [
            createCard({ id: "C3A", commonId: Sacrifice.CommonId }),
          ],
        },
        P2A: {
          cardsInZone: [
            createCard({ id: "C2A", type: "spaceShip", attack: 1 }),
          ],
          events: [
            PutDownCardEvent({
              cardId: "C2A",
              turn: 2,
              location: "zone",
            }),
            MoveCardEvent({ cardId: "C2A", turn: 3 }),
          ],
        },
      },
    });

    match.putDownCard("P1A", {
      location: "zone",
      cardId: "C3A",
    });

    firstPlayerAsserter.hasRequirement({
      cardCommonId: "94",
      cardId: "C3A",
      common: true,
      count: 1,
      type: "sacrifice",
      waiting: false,
    });

    secondPlayerAsserter.hasRequirement({
      cardCommonId: "94",
      cardId: "C3A",
      common: true,
      count: 1,
      type: "sacrifice",
      waiting: false,
    });
  });
  it("and only one player has cards 'in play'", () => {
    const {
      match,
      firstPlayerAsserter,
      secondPlayerAsserter,
    } = setupIntegrationTest({
      playerOrder: ["P1A", "P2A"],
      turn: 4,
      currentPlayer: "P1A",
      playerStateById: {
        P1A: {
          phase: "action",
          cardsOnHand: [
            createCard({ id: "C3A", commonId: Sacrifice.CommonId }),
          ],
        },
        P2A: {
          cardsInZone: [
            createCard({ id: "C2A", type: "spaceShip", attack: 1 }),
          ],
          events: [
            PutDownCardEvent({
              cardId: "C2A",
              turn: 2,
              location: "zone",
            }),
            MoveCardEvent({ cardId: "C2A", turn: 3 }),
          ],
        },
      },
    });

    match.putDownCard("P1A", {
      location: "zone",
      cardId: "C3A",
    });

    // firstPlayerAsserter.hasRequirement({
    //   cardCommonId: "94",
    //   cardId: "C3A",
    //   common: true,
    //   count: 0,
    //   type: "sacrifice",
    //   waiting: true,
    // });

    secondPlayerAsserter.hasRequirement({
      cardCommonId: "94",
      cardId: "C3A",
      common: true,
      count: 1,
      type: "sacrifice",
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

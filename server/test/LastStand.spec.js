const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");
const PutDownCardEvent = require("../../shared/PutDownCardEvent.js");
const MoveCardEvent = require("../../shared/event/MoveCardEvent.js");
const TargetMissed = require("../../shared/card/TargetMissed.js");
const {
  createCard,
} = require("../../shared/test/testUtils/FakeCardDataAssembler.js");

test("when flipping the opponent last station card and opponent has target missed as flipped Station Card Zone", () => {
  const {
    match,
    firstPlayerAsserter,
    secondPlayerAsserter,
  } = setupIntegrationTest({
    playerOrder: ["P1A", "P2A"],
    turn: 3,
    currentPlayer: "P1A",
    playerStateById: {
      P1A: {
        phase: "attack",
        cardsInOpponentZone: [
          createCard({ id: "Carta1A", type: "spaceShip", attack: 1 }),
        ],
        events: [
          PutDownCardEvent({
            cardId: "Carta1A",
            turn: 1,
            location: "zone",
          }),
          MoveCardEvent({ cardId: "Carta1A", turn: 2 }),
        ],
      },
      P2A: {
        stationCards: [
          stationCard("StationCard1A", "action"),
          {
            place: "draw",
            card: createCard({
              id: "StationCard2A",
              commonId: TargetMissed.CommonId,
              type: "event",
            }),
            flipped: true,
          },
        ],
      },
    },
  });

  match.attackStationCard("P1A", {
    attackerCardId: "Carta1A",
    targetStationCardIds: ["StationCard1A"],
  });

  secondPlayerAsserter.hasStartedLastStandForPlayer("P2A");
});

function stationCard(id = "some_id", place = "draw") {
  return {
    place,
    card: createCard({ id }),
  };
}

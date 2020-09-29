const PutDownCardEvent = require("../../../shared/PutDownCardEvent.js");
const Carrier = require("../../../shared/card/Carrier.js");
const { setupFromState } = require("./botTestHelpers.js");

it("When bot have not used dormant effect of Carrier in the turn", async () => {
  const { matchController } = await setupFromState({
    turn: 3,
    phase: "attack",
    cardsInZone: [{ id: "C1A", type: "spaceShip", commonId: Carrier.CommonId }],
    opponentStationCards: [unflippedStationCard("S1A")],
    events: [PutDownCardEvent({ cardId: "C1A", turn: 1, location: "zone" })],
  });

  expect(matchController.emit).toHaveBeenCalledWith(
    "triggerDormantEffect",
    "C1A"
  );
});

function unflippedStationCard(id, place = "draw") {
  return {
    id,
    place,
    card: { id },
  };
}

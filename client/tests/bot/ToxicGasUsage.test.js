const PutDownCardEvent = require("../../../shared/PutDownCardEvent.js");
const ToxicGas = require("../../../shared/card/ToxicGas");
const MegaShield = require("../../../shared/card/MegaShield");
const { setupFromState } = require("./botTestHelpers.js");

it("Toxic gas should not attack when there its not requirement", async () => {
  const { matchController } = await setupFromState({
    turn: 3,
    phase: "attack",
    cardsInZone: [{ id: "C1A", commonId: ToxicGas.CommonId }],
    opponentCardsInZone: [{ id: "C2A", commonId: MegaShield.CommonId }],
    events: [PutDownCardEvent({ cardId: "C1A", turn: 1, location: "zone" })],
  });

  expect(matchController.emit).not.toHaveBeenCalledWith("attack", {
    attackerCardId: "C1A",
    defenderCardId: "C2A",
  });
});

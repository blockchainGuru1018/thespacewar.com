const { setupFromState } = require("./botTestHelpers.js");
const MegaShield = require("../../../shared/card/MegaShield.js");

test("when has requirement damageShieldCard should emit attack shield", async () => {
  const fakeRawCardData = [{ id: MegaShield.CommonId, price: "1" }];
  const { matchController } = await setupFromState(
    {
      turn: 2,
      phase: "attack",
      requirements: [
        {
          type: "damageShieldCard",
          count: 1,
        },
      ],
      cardsOnHand: [{ id: "C1A" }],
      opponentCardsInZone: [{ id: "C2A", commonId: MegaShield.CommonId }],
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith("damageShieldCards", {
    targetIds: ["C2A"],
  });
});

const { setupFromState } = require("./botTestHelpers.js");
const MegaShield = require("../../../shared/card/MegaShield.js");
const Drone = require("../../../shared/card/Drone.js");
const Carrier = require("../../../shared/card/Carrier.js");
const Fusion = require("../../../shared/card/Fusion.js");
const DestroyDuration = require("../../../shared/card/DestroyDuration.js");

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

test("When have Fusion Requirement should pick carrier", async () => {
  const fakeRawCardData = [
    { id: Drone.CommonId, price: "1" },
    { id: Carrier.CommonId, price: "1" },
    { id: Fusion.CommonId, price: "1" },
    { id: MegaShield.CommonId, price: "1" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 2,
      phase: "attack",
      requirements: [
        {
          cardCommonId: Fusion.CommonId,
          type: "findCard",
          target: "discardPile",
          count: 2,
          cardGroups: [
            {
              source: "cardsInZone",
              cards: [
                {
                  id: "C1A",
                  commonId: Carrier.CommonId,
                },
                {
                  id: "C2A",
                  commonId: Drone.CommonId,
                },
                {
                  id: "C3A",
                  commonId: Drone.CommonId,
                },
              ],
            },
          ],
        },
      ],
      opponentCardsInZone: [{ id: "C2A", commonId: MegaShield.CommonId }],
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith(
    "selectCardForFindCardRequirement",
    {
      cardGroups: [{ source: "cardsInZone", cardIds: ["C2A", "C3A"] }],
    }
  );
});

test("Destroy duration should pick the most expensive duration card", async () => {
  const fakeRawCardData = [
    { id: DestroyDuration.CommonId, cost: "1" },
    { id: "2" },
    { id: "3" },
  ];
  const { matchController } = await setupFromState(
    {
      turn: 2,
      phase: "attack",
      requirements: [
        {
          cardCommonId: DestroyDuration.CommonId,
          type: "findCard",
          target: "discardPile",
          count: 1,
          cardGroups: [
            {
              source: "cardsInZone",
              cards: [
                {
                  id: "C1A",
                  commonId: "2",
                },
                {
                  id: "C2A",
                  commonId: "3",
                },
              ],
            },
          ],
        },
      ],
      opponentCardsInZone: [
        { id: "C2A", commonId: "3", cost: 4 },
        { id: "C1A", commonId: "2", cost: 1 },
      ],
    },
    fakeRawCardData
  );

  expect(matchController.emit).toBeCalledWith(
    "selectCardForFindCardRequirement",
    {
      cardGroups: [{ source: "cardsInZone", cardIds: ["C2A"] }],
    }
  );
});

const CardTypeComparer = require("./CardTypeComparer.js");
const CardCostComparer = require("./CardCostComparer.js");
const CardCommonIdComparer = require("./CardCommonIdComparer.js");
const TypesInOrder = ["defense", "missile", "spaceShip"];
const Nitro = require("../../shared/card/Fast");
const CollisionSkill = require("../../shared/card/CollisionSkill");
const Sacrifice = require("../../shared/card/Sacrifice");
const ReviveProcedure = require("../../shared/card/Revive");
const DroneLeader = require("../../shared/card/DroneLeader");
const RepairShip = require("../../shared/card/RepairShip");
const Paralyzer = require("../../shared/card/TheParalyzer");
const Carrier = require("../../shared/card/Carrier");
const ExtraDraw = require("../../shared/card/ExtraDraw");
const FreezingCold = require("../../shared/card/FreezingCold");
const Fusion = require("../../shared/card/Fusion");
const commonIdsOrder = [
  Nitro.CommonId,
  CollisionSkill.CommonId,
  FreezingCold.CommonId,
  Sacrifice.CommonId,
  ReviveProcedure.CommonId,
  ExtraDraw.CommonId,
  DroneLeader.CommonId,
  RepairShip.CommonId,
  Paralyzer.CommonId,
  Carrier.CommonId,
  Fusion.CommonId,
];
module.exports = function ({ playerStateService, types = TypesInOrder }) {
  return () => {
    const cards = playerStateService
      .getCardsOnHand()
      .slice()
      .sort(CardCostComparer({ expensiveFirst: true }))
      .sort(CardTypeComparer(types))
      .sort(CardCommonIdComparer(commonIdsOrder));

    if (cards.length) return cards[0].id;
    throw new Error("No cards to discard");
  };
};

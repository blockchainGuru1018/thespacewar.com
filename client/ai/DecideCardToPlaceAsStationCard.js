const CardTypeComparer = require("./CardTypeComparer.js");
const CardCostComparer = require("./CardCostComparer.js");

const TypesInOrder = ["defense", "missile", "spaceShip"];

module.exports = function ({ playerStateService, types = TypesInOrder }) {
  return () => {
    const cards = playerStateService
      .getCardsOnHand()
      .slice()
      .sort(CardCostComparer({ expensiveFirst: true }))
      .sort(CardTypeComparer(types));

    if (cards.length) return cards[0].id;
    throw new Error("No cards to discard");
  };
};

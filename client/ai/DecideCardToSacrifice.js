const CardTypeComparer = require("./CardTypeComparer.js");
const CardCostComparer = require("./CardCostComparer.js");

const TypesInOrder = ["duration", "event", "spaceShip", "missile", "defense"];

module.exports = function DecideCardToSacrifice({
  playerStateService,
  types = TypesInOrder,
}) {
  return () => {
    const cards = playerStateService
      .getCardsInPlay()
      .slice()
      .sort(CardCostComparer())
      .sort(CardTypeComparer(types));
    if (cards.length) return { targetIds: [cards[0].id] };
    throw new Error("No cards to discard");
  };
};

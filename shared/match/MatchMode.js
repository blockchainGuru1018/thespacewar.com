const chooseStartingPlayer = "chooseStartingPlayer";
const selectStationCards = "selectStationCards";
const game = "game";

const Order = [chooseStartingPlayer, selectStationCards, game];

module.exports = {
  Order,
  firstMode: Order[0],
  chooseStartingPlayer,
  selectStationCards,
  game,
};

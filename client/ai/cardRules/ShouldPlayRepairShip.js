const RepairShip = require("../../../shared/card/RepairShip.js");

module.exports = function ({ playerStateService }) {
  return (card) => {
    if (card.commonId !== RepairShip.CommonId) return true;

    return hasTwoOrMoreDamagedStationCards();
  };

  function hasTwoOrMoreDamagedStationCards() {
    const flippedStationCards = playerStateService.getFlippedStationCards();
    return flippedStationCards.length >= 2;
  }
};

const Revive = require("../../../shared/card/Revive.js");
const Drone = require("../../../shared/card/Drone.js");

module.exports = function ({ playerStateService }) {
  return (card) => {
    if (card.commonId !== Revive.CommonId) return true;

    return haveMoreThanOneDroneDiscarded();
  };

  function haveMoreThanOneDroneDiscarded() {
    const discardedDrones = playerStateService
      .getDiscardedCards()
      .filter((discardedCard) => discardedCard.commonId === Drone.CommonId);

    return discardedDrones.length >= 2;
  }
};

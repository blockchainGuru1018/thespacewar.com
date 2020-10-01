const Fusion = require("../../../shared/card/Fusion.js");
const Drone = require("../../../shared/card/Drone.js");

module.exports = function ({ playerStateService }) {
  return (card) => {
    if (card.commonId !== Fusion.CommonId) return true;
    return thereAreMoreThanOneDroneInPlay();
  };

  function thereAreMoreThanOneDroneInPlay() {
    const drones = playerStateService.getMatchingBehaviourCards(
      (card) => card.commonId === Drone.CommonId
    );
    return drones.length > 1;
  }
};

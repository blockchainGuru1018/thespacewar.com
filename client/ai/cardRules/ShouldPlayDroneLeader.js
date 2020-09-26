const DroneLeader = require("../../../shared/card/DroneLeader.js");
const Drone = require("../../../shared/card/Drone.js");

module.exports = function ({ playerStateService }) {
  return (card) => {
    if (card.commonId !== DroneLeader.CommonId) return true;

    return hastMoreThanThreeDronesInZone();
  };

  function hastMoreThanThreeDronesInZone() {
    const drones = playerStateService.getMatchingBehaviourCards(
      (card) => card.commonId === Drone.CommonId
    );
    return drones.length > 3;
  }
};

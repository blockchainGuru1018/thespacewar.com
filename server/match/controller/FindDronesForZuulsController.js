module.exports = function ({ playerServiceFactory }) {
  return {
    findDronesForZuuls,
  };

  function findDronesForZuuls(playerId) {
    const findDronesForZuuls = playerServiceFactory.findDronesForZuuls(
      playerId
    );
    if (!findDronesForZuuls.canIssueFindDronesForZuuls())
      throw new Error("Cannot issue find drones for Zuuls");

    findDronesForZuuls.findDronesForZuuls();
  }
};

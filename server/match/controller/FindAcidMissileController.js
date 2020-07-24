module.exports = function ({ playerServiceFactory }) {
  return {
    findAcidMissile,
  };

  function findAcidMissile(playerId) {
    const playerFindAcipMissile = playerServiceFactory.findAcidMissile(
      playerId
    );
    if (!playerFindAcipMissile.canIssueFindAcidMissile())
      throw new Error("Cannot issue find acid missile");

    playerFindAcipMissile.findAcidMissile();
  }
};

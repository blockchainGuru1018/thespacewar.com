module.exports = function ({ playerServiceFactory }) {
  return {
    findAcidProjectile,
  };

  function findAcidProjectile(playerId) {
    const playerFindAcipMissile = playerServiceFactory.findAcidProjectile(
      playerId
    );
    if (!playerFindAcipMissile.canIssueFindAcidProjectile())
      throw new Error("Cannot issue find acid missile");

    playerFindAcipMissile.findAcidProjectile();
  }
};

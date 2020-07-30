module.exports = function ({ playerServiceFactory }) {
  return {
    naaloxReviveDrone,
    naaloxRepairStationCard,
  };

  function naaloxReviveDrone(playerId) {
    const playerNaaloxDormantEffect = playerServiceFactory.naaloxDormantEffect(
      playerId
    );
    if (!playerNaaloxDormantEffect.canIssueReviveDrone())
      throw new Error("Cannot issue naalox revive drone");

    playerNaaloxDormantEffect.naaloxReviveDrone();
  }

  function naaloxRepairStationCard(playerId, { cardToRepairId }) {
    const playerNaaloxDormantEffect = playerServiceFactory.naaloxDormantEffect(
      playerId
    );
    if (!playerNaaloxDormantEffect.canIssueRepairStation())
      throw new Error("Cannot issue naalox repair  station");

    playerNaaloxDormantEffect.naaloxRepairStationCard(cardToRepairId);
  }
};

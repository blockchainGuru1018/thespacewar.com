module.exports = function ({ playerOverworkFactory }) {
  return {
    overwork,
  };

  function actionPointsForDrawExtraCard(playerId) {
    const playerOverwork = playerOverworkFactory.create(playerId);
    if (!playerOverwork.canIssueOverwork())
      throw new Error("Cannot issue Overwork");

    playerOverwork.overwork();
  }
};
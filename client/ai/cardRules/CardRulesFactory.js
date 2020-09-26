const ShouldPlayGoodKarma = require("./ShouldPlayGoodKarma.js");
const ShouldPlayDroneLeader = require("./ShouldPlayDroneLeader.js");

module.exports = function ({ BotId, playerServiceFactory }) {
  return {
    createAll,
  };

  function createAll() {
    return [shouldPlayGoodKarma(), shouldPlayDroneLeader()];
  }

  function shouldPlayGoodKarma() {
    return ShouldPlayGoodKarma({
      playerStateService: playerServiceFactory.playerStateService(BotId),
    });
  }

  function shouldPlayDroneLeader() {
    return ShouldPlayDroneLeader({
      playerStateService: playerServiceFactory.playerStateService(BotId),
    });
  }
};

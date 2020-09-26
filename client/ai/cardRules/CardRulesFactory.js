const ShouldPlayGoodKarma = require("./ShouldPlayGoodKarma.js");
const ShouldPlayDroneLeader = require("./ShouldPlayDroneLeader.js");
const ShouldPlayRepairShip = require("./ShouldPlayRepairShip.js");

module.exports = function ({ BotId, playerServiceFactory }) {
  return {
    createAll,
  };

  function createAll() {
    return [
      shouldPlayGoodKarma(),
      shouldPlayDroneLeader(),
      shouldPlayRepairShip(),
    ];
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

  function shouldPlayRepairShip() {
    return ShouldPlayRepairShip({
      playerStateService: playerServiceFactory.playerStateService(BotId),
    });
  }
};

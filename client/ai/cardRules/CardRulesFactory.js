const ShouldPlayGoodKarma = require("./ShouldPlayGoodKarma.js");
const ShouldPlayDroneLeader = require("./ShouldPlayDroneLeader.js");
const ShouldPlayRepairShip = require("./ShouldPlayRepairShip.js");
const ShouldPlayParalizer = require("./ShouldPlayParalizer.js");

module.exports = function ({ BotId, opponentUserId, playerServiceFactory }) {
  return {
    createAll,
  };

  function createAll() {
    return [
      shouldPlayGoodKarma(),
      shouldPlayDroneLeader(),
      shouldPlayRepairShip(),
      shouldPlayParalizer(),
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
  function shouldPlayParalizer() {
    return ShouldPlayParalizer({
      opponentStateService: playerServiceFactory.playerStateService(
        opponentUserId
      ),
    });
  }
};

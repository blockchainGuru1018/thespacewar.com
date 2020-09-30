const ShouldPlayGoodKarma = require("./ShouldPlayGoodKarma.js");
const ShouldPlayDroneLeader = require("./ShouldPlayDroneLeader.js");
const ShouldPlayRepairShip = require("./ShouldPlayRepairShip.js");
const ShouldPlayParalizer = require("./ShouldPlayParalizer.js");
const ShouldPlayFusionShip = require("./ShouldPlayFusionShip");

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
      shouldPlayFusionShip(),
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
  function shouldPlayFusionShip() {
    return ShouldPlayFusionShip({
      playerStateService: playerServiceFactory.playerStateService(BotId),
    });
  }
};

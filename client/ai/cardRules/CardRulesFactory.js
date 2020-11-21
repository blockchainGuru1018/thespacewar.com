const ShouldPlayGoodKarma = require("./ShouldPlayGoodKarma.js");
const ShouldPlayDroneLeader = require("./ShouldPlayDroneLeader.js");
const ShouldPlayRepairShip = require("./ShouldPlayRepairShip.js");
const ShouldPlayFusionShip = require("./ShouldPlayFusionShip");
const ShouldPlayReviveProcedure = require("./ShouldPlayReviveProcedure");
const ShouldPlaySacrifice = require("./ShouldPlaySacrifice");

module.exports = function ({ BotId, opponentUserId, playerServiceFactory }) {
  return {
    createAll,
  };

  function createAll() {
    return [
      shouldPlayGoodKarma(),
      shouldPlayDroneLeader(),
      shouldPlayRepairShip(),
      shouldPlayFusionShip(),
      shouldPlayReviveProcedure(),
      shouldPlaySacrifice(),
    ];
  }
  function shouldPlaySacrifice() {
    return ShouldPlaySacrifice({
      opponentStateService: playerServiceFactory.playerStateService(
        opponentUserId
      ),
      playerStateService: playerServiceFactory.playerStateService(BotId),
    });
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

  function shouldPlayFusionShip() {
    return ShouldPlayFusionShip({
      playerStateService: playerServiceFactory.playerStateService(BotId),
    });
  }

  function shouldPlayReviveProcedure() {
    return ShouldPlayReviveProcedure({
      playerStateService: playerServiceFactory.playerStateService(BotId),
    });
  }
};

const FusionRequirementResolver = require("./FusionRequirementResolver.js");
const DefaultRequirementResolver = require("./DefaultFindRequirementResolver.js");
const ReviveProcedureFindRequirementResolver = require("./ReviveProcedureFindRequirementResolver.js");
const DestroyDurationRequirementResolver = require("./DestroyDurationFindRequirementResolver.js");
module.exports = function ({
  opponentUserId,
  BotId,
  playerServiceFactory,
  matchController,
}) {
  return {
    createAll,
  };

  function createAll() {
    return [
      fusionRequirementResolver(),
      reviveProcedureRequirementResolver(),
      destroyDurationRequirementResolver(),
      defaultRequirementResolver(),
    ];
  }

  function fusionRequirementResolver() {
    return FusionRequirementResolver({
      playerStateService: playerServiceFactory.playerStateService(BotId),
      matchController,
    });
  }
  function destroyDurationRequirementResolver() {
    return DestroyDurationRequirementResolver({
      opponentStateService: playerServiceFactory.playerStateService(
        opponentUserId
      ),
      matchController,
    });
  }

  function reviveProcedureRequirementResolver() {
    return ReviveProcedureFindRequirementResolver({
      matchController,
    });
  }

  function defaultRequirementResolver() {
    return DefaultRequirementResolver({
      matchController,
    });
  }
};

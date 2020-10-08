const FusionRequirementResolver = require("./FusionRequirementResolver.js");
const DefaultRequirementResolver = require("./DefaultFindRequirementResolver.js");
const ReviveProcedureFindRequirementResolver = require("./ReviveProcedureFindRequirementResolver.js");
module.exports = function ({ BotId, playerServiceFactory, matchController }) {
  return {
    createAll,
  };

  function createAll() {
    return [
      fusionRequirementResolver(),
      reviveProcedureRequirementResolver(),
      defaultRequirementResolver(),
    ];
  }

  function fusionRequirementResolver() {
    return FusionRequirementResolver({
      playerStateService: playerServiceFactory.playerStateService(BotId),
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

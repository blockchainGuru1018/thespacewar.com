const FusionRequirementResolver = require("./FusionRequirementResolver.js");
const DefaultRequirementResolver = require("./DefaultFindRequirementResolver.js");

module.exports = function ({ BotId, playerServiceFactory, matchController }) {
  return {
    createAll,
  };

  function createAll() {
    return [fusionRequirementResolver(), defaultRequirementResolver()];
  }

  function fusionRequirementResolver() {
    return FusionRequirementResolver({
      playerStateService: playerServiceFactory.playerStateService(BotId),
      matchController,
    });
  }
  function defaultRequirementResolver() {
    return DefaultRequirementResolver({
      matchController,
    });
  }
};

const FakeRawCardDataRepository = require("../../../client/testUtils/FakeRawCardDataRepository.js");
const MatchFactory = require("../../match/MatchFactory.js");
const GameConfig = require("../../../shared/match/GameConfig.js");

module.exports = function FakeMatchFactory({
  socketRepository,
  userRepository,
  rawCardDataRepository = FakeRawCardDataRepository(),
  gameConfig = GameConfig(),
  logger = { log: console.log },
}) {
  return MatchFactory({
    socketRepository,
    userRepository,
    rawCardDataRepository,
    gameConfig,
    logger,
  });
};

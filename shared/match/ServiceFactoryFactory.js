const GameServiceFactory = require("./GameServiceFactory.js");
const PlayerServiceFactory = require("./PlayerServiceFactory.js");
const PlayerRequirementServicesFactory = require("./PlayerRequirementServicesFactory.js");
const PlayerCardServicesFactory = require("./PlayerCardServicesFactory.js");
const ActionPointsCalculator = require("./ActionPointsCalculator.js");
const CardFacadeContext = require("./card/CardFacadeContext.js");

module.exports = function ({
  state,
  players,
  cardInfoRepository,
  logger,
  rawCardDataRepository,
  endMatch,
  gameConfig,
  registerLogGame,
  actionPointsCalculator = ActionPointsCalculator({ cardInfoRepository }),
}) {
  const objectsByNameAndPlayerId = {};

  const api = {
    _cache: objectsByNameAndPlayerId,
    gameServiceFactory: cached(gameServiceFactory),
    playerServiceFactory: cached(playerServiceFactory),
    playerRequirementServicesFactory: cached(playerRequirementServicesFactory),
    playerCardServicesFactory: cached(playerCardServicesFactory),
    cardFacadeContext: cached(cardFacadeContext),
  };

  return api;

  function gameServiceFactory() {
    return GameServiceFactory({
      state,
      endMatch,
      rawCardDataRepository,
      gameConfig,
      registerLogGame,
    });
  }

  function playerServiceFactory() {
    return PlayerServiceFactory({
      state,
      endMatch,
      actionPointsCalculator,
      logger,
      gameConfig,
      gameServiceFactory: api.gameServiceFactory(),
      userRepository: {
        getById: (id) => players.find((p) => p.id === id),
      },
    });
  }

  function playerRequirementServicesFactory() {
    return PlayerRequirementServicesFactory({
      playerServiceFactory: api.playerServiceFactory(),
      playerCardServicesFactory: api.playerCardServicesFactory(),
    });
  }

  function playerCardServicesFactory() {
    return PlayerCardServicesFactory({
      playerServiceFactory: api.playerServiceFactory(),
    });
  }

  function cardFacadeContext() {
    return CardFacadeContext({
      playerServiceFactory: api.playerServiceFactory(),
    });
  }

  function cached(constructor) {
    const name = constructor.name;
    return (playerIdOrUndefined) => {
      const key = name + ":" + playerIdOrUndefined;
      const existingCopy = objectsByNameAndPlayerId[key];
      if (existingCopy) return existingCopy;

      const result = constructor(playerIdOrUndefined);
      objectsByNameAndPlayerId[key] = result;
      return result;
    };
  }
};

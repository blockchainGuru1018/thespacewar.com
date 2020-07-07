const PlayerServiceFactory = require("../../match/PlayerServiceFactory.js");
const GameServiceFactory = require("../../match/GameServiceFactory.js");
const CardDataAssembler = require("../../CardDataAssembler.js");
const CardInfoRepository = require("../../CardInfoRepository.js");
const ActionPointsCalculator = require("../../match/ActionPointsCalculator.js");
const GameConfig = require("../../match/GameConfig.js");

module.exports = function (
    state,
    { gameConfig = GameConfig(), testCardData = [] } = {}
) {
    const cardDataAssembler = CardDataAssembler({
        rawCardDataRepository: { get: () => testCardData },
    });
    const cardInfoRepository = CardInfoRepository({ cardDataAssembler });
    const actionPointsCalculator = ActionPointsCalculator({
        cardInfoRepository,
    });

    const logger = {
        log: (...args) => console.log(...args),
    };
    const endMatch = () => {};

    const gameServiceFactory = GameServiceFactory({
        state,
        logger,
        endMatch,
        actionPointsCalculator,
        gameConfig,
    });
    const playerServiceFactory = PlayerServiceFactory({
        state,
        logger,
        endMatch,
        actionPointsCalculator,
        gameConfig,
        gameServiceFactory,
        userRepository: {
            getById: () => ({}),
        },
    });

    const api = {
        stub,
    };
    const apiProxy = new Proxy(api, {
        get(target, prop, receiver) {
            if (prop in playerServiceFactory) {
                return playerServiceFactory[prop];
            } else if (prop in gameServiceFactory) {
                return gameServiceFactory[prop];
            }
            return target[prop];
        },
    });
    return apiProxy;

    function stub(name, playerId, object) {
        gameServiceFactory._cache[name + ":" + playerId] = object;
        playerServiceFactory._cache[name + ":" + playerId] = object;
    }
};

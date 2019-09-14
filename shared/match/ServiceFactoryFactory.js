const GameServiceFactory = require('./GameServiceFactory.js');
const PlayerServiceFactory = require('./PlayerServiceFactory.js');
const ActionPointsCalculator = require('./ActionPointsCalculator.js');
const CardFacadeContext = require('./card/CardFacadeContext.js');

module.exports = function ({
    state,
    players,
    cardInfoRepository,
    logger,
    rawCardDataRepository,
    endMatch,
    gameConfig,
    actionPointsCalculator = ActionPointsCalculator({ cardInfoRepository })
}) {

    const objectsByNameAndPlayerId = {};

    const api = {
        _cache: objectsByNameAndPlayerId,
        gameServiceFactory: cached(gameServiceFactory),
        playerServiceFactory: cached(playerServiceFactory),
        cardFacadeContext: cached(cardFacadeContext),
    };

    return api;

    function gameServiceFactory() {
        return GameServiceFactory({
            state,
            endMatch,
            rawCardDataRepository,
            gameConfig
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
                getById: id => players.find(p => p.id === id)
            }
        });
    }

    function cardFacadeContext() {
        return CardFacadeContext({
            playerServiceFactory: api.playerServiceFactory()
        });
    }

    function cached(constructor) {
        const name = constructor.name;
        return (playerIdOrUndefined) => {
            const key = name + ':' + playerIdOrUndefined;
            const existingCopy = objectsByNameAndPlayerId[key];
            if (existingCopy) return existingCopy;

            const result = constructor(playerIdOrUndefined);
            objectsByNameAndPlayerId[key] = result;
            return result;
        };
    }
};

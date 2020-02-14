const PlayerCardFactory = require('./card/PlayerCardFactory.js');

module.exports = function PlayerCardServicesFactory({
    playerServiceFactory
}) {

    const objectsByNameAndPlayerId = {};

    const api = {
        _cache: objectsByNameAndPlayerId,
        playerCardFactory: cached(playerCardFactory)
    };

    return api;

    function playerCardFactory(playerId) {
        return PlayerCardFactory({
            playerStateService: playerServiceFactory.playerStateService(playerId),
            cardFactory: playerServiceFactory.cardFactory()
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

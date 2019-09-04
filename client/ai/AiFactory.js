
module.exports = function ({
}) {

    const objectsByNameAndPlayerId = {};

    const api = {
        _cache: objectsByNameAndPlayerId,
        // playerStationAttacker: cached(playerStationAttacker),
        playerStateService: () => {}
    };

    return api;

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

module.exports = function ({ playerServiceFactory }) {
    return {
        create,
    };

    function create(playerId) {
        return playerServiceFactory.playerOverwork(playerId);
    }
};

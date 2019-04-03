module.exports = function ({
    playerServiceProvider,
    playerOverworkFactory
}) {

    return {
        overwork
    };

    function overwork(playerId) {
        const playerOverwork = playerOverworkFactory.create(playerId);
        playerOverwork.overwork();
    }
};
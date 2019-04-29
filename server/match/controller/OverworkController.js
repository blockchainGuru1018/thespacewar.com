module.exports = function ({
    playerOverworkFactory
}) {

    return {
        overwork
    };

    function overwork(playerId) {
        const playerOverwork = playerOverworkFactory.create(playerId);
        if (playerOverwork.canIssueOverwork()) {
            playerOverwork.overwork();
        }
    }
};

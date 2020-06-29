module.exports = function ({
    playerServiceFactory
}) {

    return {
        perfectPlan
    };

    function perfectPlan(playerId) {
        const playerPerfectPlan = playerServiceFactory.playerPerfectPlan(playerId);
        if (!playerPerfectPlan.canIssuePerfectPlan()) throw new Error('Cannot issue Overwork');

        playerPerfectPlan.perfectPlan();
    }
};

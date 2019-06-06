module.exports = function ({
    playerServiceProvider,
}) {

    return {
        getType: () => 'addDamageStationCardRequirement',
        forPlayerWithData
    };

    function forPlayerWithData(playerId, { count }) {
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        playerRequirementService.addRequirement({ type: 'damageStationCard', count });
    }
};

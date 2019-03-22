module.exports = function ({
    playerServiceProvider,
}) {

    return {
        getType: () => 'addRequirement',
        forPlayerWithData
    };

    function forPlayerWithData(playerId, requirement) {
        const playerRequirementService = playerServiceProvider.getRequirementServiceById(playerId);
        playerRequirementService.addRequirement(requirement);

        return { message: 'all requirements', requirements: playerRequirementService.getRequirements() };
    }
};
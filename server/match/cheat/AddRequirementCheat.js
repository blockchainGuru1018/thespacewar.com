module.exports = function ({ playerServiceProvider, playerServiceFactory }) {
    return {
        getType: () => "addRequirement",
        forPlayerWithData,
    };

    function forPlayerWithData(playerId, requirement) {
        const addRequirementFromSpec = playerServiceFactory.addRequirementFromSpec(
            playerId
        );
        addRequirementFromSpec.forReasonAndSpec("cheat", requirement);

        const playerRequirementService = playerServiceProvider.getRequirementServiceById(
            playerId
        );
        return {
            message: "all requirements",
            requirements: playerRequirementService.all(),
        };
    }
};

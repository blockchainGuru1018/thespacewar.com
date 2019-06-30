module.exports = function ({
    playerServiceFactory
}) {

    return {
        getType: () => 'addDamageStationCardRequirement',
        forPlayerWithData
    };

    function forPlayerWithData(playerId, { count }) {
        const addRequirementFromSpec = playerServiceFactory.addRequirementFromSpec(playerId);
        addRequirementFromSpec.forReasonAndSpec('cheat', { type: 'damageStationCard', count });
    }
};

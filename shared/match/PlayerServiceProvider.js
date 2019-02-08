const TYPE = {
    state: 'state',
    requirement: 'requirement'
}

PlayerServiceProvider.TYPE = TYPE;

function PlayerServiceProvider() {

    const servicesByTypeAndPlayerId = {};

    return {
        TYPE,
        registerService,
        getStateServiceById,
        getRequirementServiceById
    };

    function registerService(type, playerId, service) {
        servicesByTypeAndPlayerId[`${type}:${playerId}`] = service;
    }

    function getStateServiceById(playerId) {
        return servicesByTypeAndPlayerId[`${TYPE.state}:${playerId}`];
    }

    function getRequirementServiceById(playerId) {
        return servicesByTypeAndPlayerId[`${TYPE.requirement}:${playerId}`];
    }
}

module.exports = PlayerServiceProvider;
const TYPE = {
    state: 'state',
    requirement: 'requirement',
    canThePlayer: 'canThePlayer'
}

PlayerServiceProvider.TYPE = TYPE;

function PlayerServiceProvider() {

    const servicesByTypeAndPlayerId = {};

    return {
        TYPE,
        registerService,
        getStateServiceById,
        getRequirementServiceById,
        getCanThePlayerServiceById
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

    function getCanThePlayerServiceById(playerId) {
        return servicesByTypeAndPlayerId[`${TYPE.canThePlayer}:${playerId}`];
    }
}

module.exports = PlayerServiceProvider;
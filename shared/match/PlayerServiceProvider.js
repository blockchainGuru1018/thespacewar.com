const TYPE = {
    state: "state",
    requirement: "requirement",
    canThePlayer: "canThePlayer",
    rule: "rule",
    phase: "phase",
    turnControl: "turnControl",
};

PlayerServiceProvider.TYPE = TYPE;

function PlayerServiceProvider() {
    const servicesByTypeAndPlayerId = {};

    return {
        TYPE,
        registerService,
        byTypeAndId,
        getStateServiceById,
        getRequirementServiceById,
        getCanThePlayerServiceById,
        getRuleServiceById,
    };

    function registerService(type, playerId, service) {
        servicesByTypeAndPlayerId[`${type}:${playerId}`] = service;
    }

    function byTypeAndId(playerServiceType, playerId) {
        return servicesByTypeAndPlayerId[`${playerServiceType}:${playerId}`];
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

    function getRuleServiceById(playerId) {
        return servicesByTypeAndPlayerId[`${TYPE.rule}:${playerId}`];
    }
}

module.exports = PlayerServiceProvider;

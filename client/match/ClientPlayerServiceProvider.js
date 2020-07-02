const TYPE = require('../../shared/match/PlayerServiceProvider.js').TYPE;

function ClientPlayerServiceProvider(state, getters) {

    const ownUserId = state.ownUser.id;

    return {
        byTypeAndId,
        getStateServiceById,
        getRequirementServiceById,
        getCanThePlayerServiceById,
        getRuleServiceById
    };

    function byTypeAndId(playerServiceType, playerId) {
        const name = nameForType(playerServiceType, playerId);
        return getters[name];
    }

    function getStateServiceById(playerId) {
        return getters[nameForType(TYPE.state, playerId)];
    }

    function getRequirementServiceById(playerId) {
        return getters[nameForType(TYPE.requirement, playerId)];
    }

    function getCanThePlayerServiceById(playerId) {
        return getters[nameForType(TYPE.canThePlayer, playerId)];
    }

    function getRuleServiceById(playerId) {
        return getters[nameForType(TYPE.rule, playerId)];
    }

    function nameForType(type, playerId) {
        if (type === TYPE.canThePlayer) {
            return playerId === ownUserId ? 'canThePlayer' : 'canTheOpponent';
        }
        if (type === TYPE.phase) {
            return playerId === ownUserId ? 'playerPhase' : 'opponentPhase';
        }
        return genericNameForType(type, playerId);
    }

    function genericNameForType(type, playerId) {
        return (playerId === ownUserId ? 'player' : 'opponent') + capitalize(type) + 'Service';
    }
}

function capitalize(word) {
    return word[0].toUpperCase() + word.substr(1);
}

module.exports = ClientPlayerServiceProvider;

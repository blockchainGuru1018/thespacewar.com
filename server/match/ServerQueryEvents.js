const QueryEvents = require('../../shared/event/QueryEvents.js');

class ServerQueryEvents extends QueryEvents {

    constructor(deps) {
        const playerId = deps.playerId;
        const matchService = deps.matchService;

        const eventRepository = {
            getAll: () => matchService.getPlayerState(playerId).events
        };

        const opponentId = matchService.getOpponentId(playerId);
        const opponentEventRepository = {
            getAll: () => matchService.getPlayerState(opponentId).events
        };

        super({ eventRepository, opponentEventRepository, matchService });
    }
}

module.exports = ServerQueryEvents;

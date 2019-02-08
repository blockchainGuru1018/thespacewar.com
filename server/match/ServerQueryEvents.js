const QueryEvents = require('../../shared/event/QueryEvents.js');

class ServerQueryEvents extends QueryEvents {

    constructor(deps) {
        const playerId = deps.playerId;
        const matchService = deps.matchService;

        const eventRepository = {
            getAll: () => matchService.getPlayerState(playerId).events
        };
        super({ eventRepository });
    }
}

module.exports = ServerQueryEvents;
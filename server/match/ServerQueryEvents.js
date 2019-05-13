const QueryEvents = require('../../shared/event/QueryEvents.js');

class ServerQueryEvents extends QueryEvents {

    constructor({ playerId, matchService }) {
        const eventRepository = {
            getAll: () => {
                return matchService.getPlayerState(playerId).events
            }
        };

        const opponentId = matchService.getOpponentId(playerId);
        const opponentEventRepository = {
            getAll: () => matchService.getPlayerState(opponentId).events
        };

        super({ eventRepository, opponentEventRepository, matchService });
    }
}

module.exports = ServerQueryEvents;

const CardFactory = require('../../shared/card/CardFactory.js');
const MatchService = require('../../shared/match/MatchService.js');
const QueryEvents = require('../../shared/event/QueryEvents.js');
const EventRepository = require('../../shared/event/EventRepository.js');

function ServerCardFactory({
    getFreshState,
    playerServiceProvider
}) {

    const matchService = new MatchService();

    return {
        createCardForPlayer
    };

    function createCardForPlayer(cardData, playerId) {
        matchService.setState(getFreshState());

        const eventRepository = EventRepository({ playerId, playerServiceProvider });
        const queryEvents = new QueryEvents({ eventRepository });
        const cardFactory = new CardFactory({ matchService, playerServiceProvider, queryEvents });
        return cardFactory.createCardForPlayer(cardData, playerId);
    }
}

module.exports = ServerCardFactory;
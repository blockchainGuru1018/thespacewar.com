const CardFactory = require('../../shared/card/CardFactory.js');
const MatchService = require('../../shared/match/MatchService.js');
const QueryEvents = require('../../shared/event/QueryEvents.js');
const EventRepository = require('../../shared/event/EventRepository.js');

function ServerCardFactory({
    getFreshState,
    playerServiceProvider,
    requirementFactory
}) {

    const matchService = new MatchService();

    return {
        createCardForPlayer
    };

    function createCardForPlayer(cardData, playerId) {
        matchService.setState(getFreshState());

        const eventRepository = EventRepository({ playerId, playerServiceProvider });
        const opponentId = matchService.getOpponentId(playerId);
        const opponentEventRepository = EventRepository({ playerId: opponentId, playerServiceProvider });
        const queryEvents = new QueryEvents({ eventRepository, opponentEventRepository, matchService });
        const cardFactory = new CardFactory({ matchService, playerServiceProvider, queryEvents, requirementFactory });
        return cardFactory.createCardForPlayer(cardData, playerId);
    }
}

module.exports = ServerCardFactory;

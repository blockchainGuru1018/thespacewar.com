const Card = require('../../shared/card/Card.js');
const MatchInfoRepository = require('../../shared/match/MatchInfoRepository.js');
const EventRepository = require('../../shared/event/EventRepository.js');

module.exports = function CardFactory(deps) {

    const getState = deps.getState;

    return {
        createCardForPlayer
    };

    function createCardForPlayer(cardData, playerId) {
        const state = getState();
        return Card({
            card: cardData,
            playerId,
            eventRepository: EventRepository({
                events: state.playerStateById[playerId].events
            }),
            matchInfoRepository: MatchInfoRepository(state)
        });
    }
}
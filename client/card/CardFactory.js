const Card = require('../../shared/card/Card.js');
const MatchInfoRepository = require('../../shared/match/MatchInfoRepository.js');
const EventRepository = require('../../shared/event/EventRepository.js');

module.exports = function CardFactory() {
    return {
        createFromVuexStore
    };

    function createFromVuexStore(card, state) {
        return Card({
            card,
            eventRepository: EventRepository(state),
            matchInfoRepository: MatchInfoRepository(state)
        });
    }
}
const Card = require('../../shared/card/Card.js');
const MatchInfoRepository = require('../../shared/match/MatchInfoRepository.js');
const EventRepository = require('../../shared/event/EventRepository.js');

module.exports = function CardFactory() {
    return {
        createFromData
    };

    function createFromData(card, { turn, events }) {
        return Card({
            card,
            eventRepository: EventRepository({ events }),
            matchInfoRepository: MatchInfoRepository({ turn })
        });
    }
}
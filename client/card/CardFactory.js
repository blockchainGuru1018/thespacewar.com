const Card = require('../../shared/card/Card.js');
const MatchInfoRepository = require('../../shared/match/MatchInfoRepository.js');
const EventRepository = require('../../shared/event/EventRepository.js');
const CardFactory = require('../../shared/CardFactory.js');

module.exports = function () {

    const cardFactory = CardFactory();

    return {
        createFromVuexStore
    };

    function createFromVuexStore(cardInfo, state) {
        let cardData = !!cardInfo.commonId
            ? { ...cardFactory.createFromCommonId(cardInfo.commonId), ...cardInfo }
            : { ...cardInfo };

        return Card({
            card: cardData,
            eventRepository: EventRepository(state),
            matchInfoRepository: MatchInfoRepository(state)
        });
    }
}
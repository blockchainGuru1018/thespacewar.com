const BaseCard = require('./BaseCard.js');
const classByCardCommonId = require('./classByCardCommonId.js');
const MatchInfoRepository = require('../match/MatchInfoRepository.js');
const EventRepository = require('../event/EventRepository.js');
const QueryEvents = require('../event/QueryEvents.js');

module.exports = class CardFactory {

    constructor({
        matchService
    }) {
        this._matchService = matchService;
    }

    createCardForPlayer(cardData, playerId) {
        const state = this._matchService.getState();
        const Constructor = getCardConstructor(cardData);
        const eventRepository = EventRepository({
            events: state.playerStateById[playerId].events
        })
        return new Constructor({
            card: cardData,
            playerId,
            eventRepository,
            queryEvents: new QueryEvents(eventRepository),
            matchInfoRepository: MatchInfoRepository(state),
            matchService: this._matchService
        });
    }
}

function getCardConstructor({ commonId }) {
    return classByCardCommonId[commonId] || BaseCard;
}

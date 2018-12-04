const BaseCard = require('./BaseCard.js');
const classByCardCommonId = require('./classByCardCommonId.js');
const MatchInfoRepository = require('../match/MatchInfoRepository.js');
const EventRepository = require('../event/EventRepository.js');

module.exports = class CardFactory {

    constructor(deps) {
        this._matchService = deps.matchService;
    }

    createCardForPlayer(cardData, playerId) {
        const state = this._matchService.getState();
        const Constructor = getCardConstructor(cardData);
        return new Constructor({
            card: cardData,
            playerId,
            eventRepository: EventRepository({
                events: state.playerStateById[playerId].events
            }),
            matchInfoRepository: MatchInfoRepository(state),
            matchService: this._matchService
        });
    }
}

function getCardConstructor({ commonId }) {
    return classByCardCommonId[commonId] || BaseCard;
}

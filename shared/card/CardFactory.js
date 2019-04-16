const BaseCard = require('./BaseCard.js');
const classByCardCommonId = require('./classByCardCommonId.js');
const MatchInfoRepository = require('../match/MatchInfoRepository.js');

module.exports = class CardFactory {

    constructor({
        matchService,
        playerServiceProvider,
        queryEvents
    }) {
        this._matchService = matchService;
        this._playerServiceProvider = playerServiceProvider;
        this._queryEvents = queryEvents;
    }

    createCardForPlayer(cardData, playerId) {
        const state = this._matchService.getState();
        const Constructor = getCardConstructor(cardData);
        const stateServiceById = this._playerServiceProvider.getStateServiceById(playerId)
        return new Constructor({
            card: cardData,
            playerId,
            queryEvents: this._queryEvents,
            matchInfoRepository: MatchInfoRepository(state),
            matchService: this._matchService,
            playerStateService: stateServiceById,
            canThePlayer: this._playerServiceProvider.getCanThePlayerServiceById(playerId)
        });
    }
};

function getCardConstructor({ commonId }) {
    return classByCardCommonId[commonId] || BaseCard;
}

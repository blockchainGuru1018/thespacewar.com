const BaseCard = require('./BaseCard.js');
const classByCardCommonId = require('./classByCardCommonId.js');
const MatchInfoRepository = require('../match/MatchInfoRepository.js');
const EventRepository = require('../event/EventRepository.js');
const QueryEvents = require('../event/QueryEvents.js');

module.exports = class CardFactory {

    constructor({
        matchService,
        playerServiceProvider,
        playerServiceFactory
    }) {
        this._matchService = matchService;
        this._playerServiceProvider = playerServiceProvider;
        this._playerServiceFactory = playerServiceFactory;
    }

    createCardForPlayer(cardData, playerId) {
        const matchService = this._matchService;

        const state = matchService.getState();
        const Constructor = getCardConstructor(cardData);
        const stateServiceById = this._playerServiceProvider.getStateServiceById(playerId);

        const playerServiceProvider = this._playerServiceProvider;
        const eventRepository = EventRepository({ playerId, playerServiceProvider });
        const opponentId = matchService.getOpponentId(playerId);
        const opponentEventRepository = EventRepository({ playerId: opponentId, playerServiceProvider });
        const queryEvents = new QueryEvents({ eventRepository, opponentEventRepository, matchService });

        return new Constructor({
            card: cardData,
            playerId,
            queryEvents,
            matchInfoRepository: MatchInfoRepository(state),
            matchService: matchService,
            playerStateService: stateServiceById,
            canThePlayer: this._playerServiceProvider.getCanThePlayerServiceById(playerId),
            addRequirementFromSpec: this._playerServiceFactory.addRequirementFromSpec(playerId)
        });
    }
};

function getCardConstructor({ commonId }) {
    return classByCardCommonId[commonId] || BaseCard;
}

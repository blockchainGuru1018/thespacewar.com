const playerStateServiceFactory = require("./playerStateServiceFactory.js");
const PlayerPhase = require('../../match/PlayerPhase.js');
const MatchService = require('../../match/MatchService.js');
const TurnControl = require('../../match/TurnControl.js');
const SourceFetcher = require('../../match/requirement/SourceFetcher.js');
const CanThePlayer = require('../../match/CanThePlayer.js');
const QueryEvents = require('../../event/QueryEvents.js');
const EventRepository = require('../../event/EventRepository2.js');
const PlayerServiceFactory = require('../../match/PlayerServiceFactory.js');
const GameServiceFactory = require('../../match/GameServiceFactory.js');
const CardDataAssembler = require('../../CardDataAssembler.js');
const CardInfoRepository = require('../../CardInfoRepository.js');
const ActionPointsCalculator = require('../../match/ActionPointsCalculator.js');

module.exports = function (state, {
    testCardData = []
} = {}) {

    const cardDataAssembler = CardDataAssembler({ rawCardDataRepository: { get: () => testCardData } });
    const cardInfoRepository = CardInfoRepository({ cardDataAssembler });
    const actionPointsCalculator = ActionPointsCalculator({ cardInfoRepository });

    const logger = {
        log: (...args) => console.log(...args)
    };
    const endMatch = () => console.log('Trying to endMatch in the tests');

    const gameServiceFactory = GameServiceFactory({
        state,
        logger,
        endMatch,
        actionPointsCalculator
    });
    const playerServiceFactory = PlayerServiceFactory({
        state,
        logger,
        endMatch,
        actionPointsCalculator
    });

    const api = {
        stub
    };
    const apiProxy = new Proxy(api, {
        get(target, prop, receiver) {
            if (prop in playerServiceFactory) {
                return playerServiceFactory[prop];
            }
            else if (prop in gameServiceFactory) {
                return gameServiceFactory[prop];
            }
            return target[prop];
        }
    });
    return apiProxy;

    function stub(name, playerId, object) {
        gameServiceFactory._cache[name + ':' + playerId] = object;
        playerServiceFactory._cache[name + ':' + playerId] = object;
    }
};

const PlayerPhase = require('./PlayerPhase.js');
const MatchService = require('./MatchService.js');
const TurnControl = require('./TurnControl.js');
const SourceFetcher = require('./requirement/SourceFetcher.js');
const CanThePlayer = require('./CanThePlayer.js');
const ServerQueryEvents = require('../../server/match/ServerQueryEvents.js');
const EventRepository = require('../event/EventRepository2.js');
const PlayerServiceProvider = require('./PlayerServiceProvider.js');
const PlayerStateService = require('./PlayerStateService.js');
const CardFactory = require('../card/CardFactory.js');
const EventFactory = require('../event/EventFactory.js');
const PlayerRequirementService = require('./requirement/PlayerRequirementService.js');
const PlayerRequirementFactory = require('./requirement/PlayerRequirementFactory.js');
const PlayerRuleService = require('./PlayerRuleService.js');
const QueryAttacks = require('./requirement/QueryAttacks.js');
const OverworkEventFactory = require('./overwork/event/OverworkEventFactory.js');
const PlayerOverwork = require('./overwork/PlayerOverwork.js');

const ServiceTypes = PlayerServiceProvider.TYPE;

module.exports = function ({ state, logger, endMatch, gameConfig, actionPointsCalculator }) {

    const objectsByNameAndPlayerId = {};

    let playerServiceProvider;

    const api = {
        _cache: objectsByNameAndPlayerId,
        playerServiceProvider: () => playerServiceProvider,
        playerOverwork: cached(playerOverwork),
        overworkEventFactory: cached(overworkEventFactory),
        cardFactory: cached(cardFactory),
        matchService: cached(matchService),
        queryAttacks: cached(queryAttacks),
        playerStateService: cached(playerStateService),
        playerRequirementService: cached(playerRequirementService),
        playerRuleService: cached(playerRuleService),
        playerPhase: cached(playerPhase),
        turnControl: cached(turnControl),
        playerRequirementFactory: cached(playerRequirementFactory),
        canThePlayer: cached(canThePlayer),
        sourceFetcher: cached(sourceFetcher),
        eventRepository: cached(eventRepository),
        eventFactory: cached(eventFactory),
        opponentId: cached(opponentId),
        queryEvents: cached(queryEvents),
        actionPointsCalculator: () => actionPointsCalculator
    };

    playerServiceProvider = {
        TYPE: ServiceTypes,
        byTypeAndId(type, playerId) {
            if (type === ServiceTypes.state) {
                return api.playerStateService(playerId);
            }
            if (type === ServiceTypes.requirement) {
                return api.playerRequirementService(playerId);
            }
            if (type === ServiceTypes.canThePlayer) {
                return api.canThePlayer(playerId);
            }
            if (type === ServiceTypes.rule) {
                return api.playerRuleService(playerId);
            }
            if (type === ServiceTypes.phase) {
                return api.playerPhase(playerId);
            }
            if (type === ServiceTypes.turnControl) {
                return api.turnControl(playerId);
            }

            throw new Error('Cannot find a player service for type: ' + type);
        },
        getStateServiceById(playerId) {
            return api.playerStateService(playerId);
        },
        getRequirementServiceById(playerId) {
            return api.playerRequirementService(playerId);
        },
        getCanThePlayerServiceById(playerId) {
            return api.canThePlayer(playerId);
        },
        getRuleServiceById(playerId) {
            return api.playerRuleService(playerId);
        }
    };

    return api;

    function playerOverwork(playerId) {
        return PlayerOverwork({
            matchService: api.matchService(),
            overworkEventFactory: api.overworkEventFactory(playerId),
            playerStateService: api.playerStateService(playerId),
            playerRequirementService: api.playerRequirementService(playerId),
            opponentRequirementService: api.playerRequirementService(api.opponentId(playerId)),
            gameConfig
        });
    }

    function overworkEventFactory(playerId) {
        return OverworkEventFactory({
            matchService: api.matchService(),
            playerStateService: api.playerStateService(playerId)
        });
    }

    function playerPhase(playerId) {
        return new PlayerPhase({
            matchService: api.matchService(),
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(api.opponentId(playerId))
        });
    }

    function eventRepository(playerId) {
        return EventRepository({ playerStateService: api.playerStateService(playerId) });
    }

    function eventFactory() {
        return EventFactory({ matchService: api.matchService() });
    }

    function opponentId(playerId) {
        return api.matchService().getOpponentId(playerId);
    }

    function cardFactory() {
        return new CardFactory({
            matchService: api.matchService(),
            playerServiceProvider
        });
    }

    function playerRequirementService(playerId) {
        const opponentId = api.opponentId(playerId);
        return new PlayerRequirementService({
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(opponentId),
            playerRequirementFactory: api.playerRequirementFactory(playerId),
            opponentRequirementFactory: api.playerRequirementFactory(opponentId)
        });
    }

    function playerRequirementFactory(playerId) {
        return PlayerRequirementFactory({
            sourceFetcher: api.sourceFetcher(playerId),
            queryAttacks: api.queryAttacks(playerId),
            opponentStateService: api.playerStateService(api.opponentId(playerId)),
            playerStateService: api.playerStateService(playerId)
        });
    }

    function sourceFetcher(playerId) {
        return SourceFetcher({
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(opponentId(playerId)),
            canThePlayer: api.canThePlayer(playerId)
        });
    }

    function canThePlayer(playerId) {
        return new CanThePlayer({
            matchService: api.matchService(),
            queryEvents: api.queryEvents(playerId),
            opponentStateService: api.playerStateService(api.opponentId(playerId)),
            playerStateService: api.playerStateService(playerId),
            turnControl: api.turnControl(playerId)
        });
    }

    function turnControl(playerId) {
        return new TurnControl({
            matchService: api.matchService(),
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(api.opponentId(playerId)),
            playerPhase: api.playerPhase(playerId),
            opponentPhase: api.playerPhase(api.opponentId(playerId)),
        });
    }

    function queryEvents(playerId) {
        return new ServerQueryEvents({ playerId, matchService: api.matchService() });
    }

    function queryAttacks(playerId) {
        let opponentId = api.opponentId(playerId);
        return QueryAttacks({
            opponentStateService: api.playerStateService(opponentId),
            playerEventRepository: api.eventRepository(playerId),
            opponentEventRepository: api.eventRepository(opponentId)
        })
    }

    function playerStateService(playerId) {
        return new PlayerStateService({
            playerId,
            gameConfig,
            queryEvents: api.queryEvents(playerId),
            matchService: api.matchService(),
            cardFactory: api.cardFactory(),
            actionPointsCalculator,
            eventFactory: api.eventFactory(),
            logger
        });
    }

    function playerRuleService(playerId) {
        return new PlayerRuleService({
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(playerId),
            playerRequirementService: api.playerRequirementService(playerId),
            canThePlayer: api.canThePlayer(playerId),
            turnControl: api.turnControl(playerId),
            playerPhase: api.playerPhase(playerId)
        });
    }

    function matchService() {
        let matchService = new MatchService({ endMatch, gameConfig });
        matchService.setState(state);
        return matchService;
    }

    function cached(constructor) {
        const name = constructor.name;
        return (playerIdOrUndefined) => {
            const key = name + ':' + playerIdOrUndefined;
            const existingCopy = objectsByNameAndPlayerId[key];
            if (existingCopy) return existingCopy;

            const result = constructor(playerIdOrUndefined);
            objectsByNameAndPlayerId[key] = result;
            return result;
        };
    }
};

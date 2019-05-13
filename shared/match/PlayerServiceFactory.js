const playerStateServiceFactory = require("../test/fakeFactories/playerStateServiceFactory.js");
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
const RequirementFactory = require('./requirement/RequirementFactory.js');
const EventFactory = require('../event/EventFactory.js');
const PlayerRequirementService = require('./requirement/PlayerRequirementService.js');
const PlayerRuleService = require('./PlayerRuleService.js');

const ServiceTypes = PlayerServiceProvider.TYPE;

module.exports = function ({ state, logger, endMatch, actionPointsCalculator }) {

    const objectsByNameAndPlayerId = {};

    let playerServiceProvider;

    const api = {
        playerServiceProvider: () => playerServiceProvider,
        cardFactory: cached(cardFactory),
        matchService: cached(matchService),
        playerStateService: cached(playerStateService),
        playerRequirementService: cached(playerRequirementService),
        playerRuleService: cached(playerRuleService),
        playerPhase: cached(playerPhase),
        turnControl: cached(turnControl),
        canThePlayer: cached(canThePlayer),
        sourceFetcher: cached(sourceFetcher),
        eventRepository: cached(eventRepository),
        eventFactory: cached(eventFactory),
        opponentId: cached(opponentId),
        queryEvents: cached(queryEvents),
        requirementFactory: cached(requirementFactory),
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

    function turnControl(playerId) {
        return new TurnControl({
            matchService: api.matchService(),
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(api.opponentId(playerId)),
            playerPhase: api.playerPhase(playerId),
            opponentPhase: api.playerPhase(api.opponentId(playerId)),
        });
    }

    function sourceFetcher(playerId) {
        let canThePlayer1 = api.canThePlayer(playerId);
        return SourceFetcher({
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(opponentId(playerId)),
            canThePlayer: canThePlayer1
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

    function queryEvents(playerId) {
        return new ServerQueryEvents({ playerId, matchService: api.matchService() });
    }

    function playerPhase(playerId) {
        return new PlayerPhase({
            matchService: api.matchService(),
            playerStateService: playerStateServiceFactory.fromIdAndState(playerId, state)
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

    function playerStateService(playerId) {
        return new PlayerStateService({
            playerId,
            queryEvents: api.queryEvents(playerId),
            matchService: api.matchService(),
            cardFactory: api.cardFactory(),
            actionPointsCalculator,
            eventFactory: api.eventFactory(),
            logger
        });
    }

    function playerRequirementService(playerId) {
        const opponentId = api.opponentId(playerId);
        return new PlayerRequirementService({
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(opponentId),
            requirementFactory: api.requirementFactory()
        });
    }

    function requirementFactory() {
        return RequirementFactory({ playerServiceProvider, matchService: api.matchService() });
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
        let matchService = new MatchService({ endMatch });
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

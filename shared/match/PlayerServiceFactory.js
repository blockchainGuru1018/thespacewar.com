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
const PlayerPerfectPlan = require('./perfectPlan/PlayerPerfectPlan.js');
const QueryAttacks = require('./requirement/QueryAttacks.js');
const OverworkEventFactory = require('./overwork/event/OverworkEventFactory.js');
const PlayerOverwork = require('./overwork/PlayerOverwork.js');
const MoveStationCard = require('./MoveStationCard.js');
const AddRequirementFromSpec = require('./requirement/AddRequirementFromSpec.js');
const StartGame = require('./StartGame.js');
const ActionLog = require('./log/ActionLog.js');
const SacrificeCard = require('./SacrificeCard.js');
const Repair = require('./Repair.js');
const Miller = require('./mill/Miller.js');
const PlayerCommanders = require('./commander/PlayerCommanders.js');
const Clock = require('../gameTimer/Clock.js');
const GameTimer = require('../gameTimer/GameTimer.js');
const PlayerPhaseControl = require('./PlayerPhaseControl.js');
const PlayerNextPhase = require('./PlayerNextPhase.js');
const PlayerStationAttacker = require('../PlayerStationAttacker.js');
const PlayerLastStand = require('./PlayerLastStand.js');

const ServiceTypes = PlayerServiceProvider.TYPE;

module.exports = function ({
    state,
    logger,
    endMatch,
    gameConfig,
    actionPointsCalculator,
    gameServiceFactory,
    userRepository
}) {

    const objectsByNameAndPlayerId = {};

    let playerServiceProvider;

    const api = {
        _cache: objectsByNameAndPlayerId,
        playerServiceProvider: () => playerServiceProvider,
        playerStationAttacker: cached(playerStationAttacker),
        playerPhaseControl: cached(playerPhaseControl),
        playerNextPhase: cached(playerNextPhase),
        playerCommanders: cached(playerCommanders),
        miller: cached(miller),
        repair: cached(repair),
        moveStationCard: cached(moveStationCard),
        playerOverwork: cached(playerOverwork),
        playerPerfectPlan: cached(playerPerfectPlan),
        overworkEventFactory: cached(overworkEventFactory),
        cardFactory: cached(cardFactory),
        matchService: cached(matchService),
        queryAttacks: cached(queryAttacks),
        startGame: cached(startGame),
        gameTimer: cached(gameTimer),
        clock: cached(clock),
        playerStateService: cached(playerStateService),
        addRequirementFromSpec: cached(addRequirementFromSpec),
        playerRequirementService: cached(playerRequirementService),
        playerRuleService: cached(playerRuleService),
        playerPhase: cached(playerPhase),
        playerLastStand: cached(playerLastStand),
        turnControl: cached(turnControl),
        playerRequirementFactory: cached(playerRequirementFactory),
        canThePlayer: cached(canThePlayer),
        sourceFetcher: cached(sourceFetcher),
        eventRepository: cached(eventRepository),
        eventFactory: cached(eventFactory),
        opponentId: cached(playerId => api.matchService().getOpponentId(playerId)),
        queryEvents: cached(queryEvents),
        sacrificeCard: cached(sacrificeCard),
        actionLog: cached(actionLog),
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

    function playerStationAttacker(playerId) {
        return PlayerStationAttacker({
            matchService: api.matchService(),
            stateSerializer: gameServiceFactory.stateSerializer(),
            stateMemento: gameServiceFactory.stateMemento(),
            playerStateService: api.playerStateService(playerId),
            canThePlayer: api.canThePlayer(playerId),
            opponentStateService: api.playerStateService(api.opponentId(playerId)),
            opponentActionLog: api.actionLog(api.opponentId(playerId)),
        });
    }

    function playerPhaseControl(playerId) {
        return PlayerPhaseControl({
            matchService: api.matchService(),
            playerStateService: api.playerStateService(playerId),
            playerNextPhase: api.playerNextPhase(playerId),
            opponentNextPhase: api.playerNextPhase(api.opponentId(playerId)),
        });
    }

    function playerNextPhase(playerId) {
        return PlayerNextPhase({
            matchService: api.matchService(),
            playerStateService: api.playerStateService(playerId),
            playerRequirementService: api.playerRequirementService(playerId),
            playerRuleService: api.playerRuleService(playerId),
            playerPhase: api.playerPhase(playerId),
            canThePlayer: api.canThePlayer(playerId),
            playerCommanders: api.playerCommanders(playerId),
            playerGameTimer: api.gameTimer(playerId),
            addRequirementFromSpec: api.addRequirementFromSpec(playerId),
            opponentStateService: api.playerStateService(api.opponentId(playerId)),
            opponentRequirementService: api.playerRequirementService(api.opponentId(playerId))
        });
    }

    function playerCommanders(playerId) {
        return PlayerCommanders({
            playerStateService: api.playerStateService(playerId)
        });
    }

    function miller(playerId) {
        return Miller({
            playerRequirementService: api.playerRequirementService(playerId),
            playerStateService: api.playerStateService(playerId),
            playerCommanders: api.playerCommanders(playerId),
            playerRuleService: api.playerRuleService(playerId),
            opponentStateService: api.playerStateService(api.opponentId(playerId)),
            opponentActionLog: api.actionLog(api.opponentId(playerId))
        });
    }

    function repair(playerId) {
        return Repair({
            matchService: api.matchService(),
            playerStateService: api.playerStateService(playerId),
            opponentActionLog: api.actionLog(api.opponentId(playerId))
        });
    }

    function moveStationCard(playerId) {
        return MoveStationCard({
            matchService: api.matchService(),
            playerStateService: api.playerStateService(playerId),
            playerPhase: api.playerPhase(playerId),
            opponentActionLog: api.actionLog(api.opponentId(playerId)),
            playerCommanders: api.playerCommanders(playerId)
        });
    }

    function playerOverwork(playerId) {
        return PlayerOverwork({
            matchService: api.matchService(),
            overworkEventFactory: api.overworkEventFactory(playerId),
            playerStateService: api.playerStateService(playerId),
            playerRequirementService: api.playerRequirementService(playerId),
            opponentRequirementService: api.playerRequirementService(api.opponentId(playerId)),
            opponentActionLog: api.actionLog(api.opponentId(playerId)),
            playerCommanders: api.playerCommanders(playerId)
        });
    }

    function playerPerfectPlan(playerId) {
        return PlayerPerfectPlan({
            playerPhase: api.playerPhase(playerId),
            overworkEventFactory: api.overworkEventFactory(playerId),
            playerStateService: api.playerStateService(playerId),
            playerRequirementService: api.playerRequirementService(playerId),
            opponentRequirementService: api.playerRequirementService(api.opponentId(playerId)),
            opponentActionLog: api.actionLog(api.opponentId(playerId)),
            playerCommanders: api.playerCommanders(playerId),
            addRequirementFromSpec: api.addRequirementFromSpec(playerId)
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

    function cardFactory() {
        return new CardFactory({
            matchService: api.matchService(),
            playerServiceProvider,
            playerServiceFactory: api,
        });
    }

    function addRequirementFromSpec(playerId) {
        const opponentId = api.opponentId(playerId);
        return AddRequirementFromSpec({
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(opponentId),
            playerRequirementService: api.playerRequirementService(playerId),
            opponentRequirementService: api.playerRequirementService(opponentId),
            playerRequirementFactory: api.playerRequirementFactory(playerId),
            opponentRequirementFactory: api.playerRequirementFactory(opponentId)
        });
    }

    function playerRequirementService(playerId) {
        const opponentId = api.opponentId(playerId);
        return new PlayerRequirementService({
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(opponentId)
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
            opponentStateService: api.playerStateService(api.opponentId(playerId)),
            canThePlayer: api.canThePlayer(playerId)
        });
    }

    function canThePlayer(playerId) {
        return new CanThePlayer({
            matchService: api.matchService(),
            queryEvents: api.queryEvents(playerId),
            opponentStateService: api.playerStateService(api.opponentId(playerId)),
            playerStateService: api.playerStateService(playerId),
            turnControl: api.turnControl(playerId),
            playerPhase: api.playerPhase(playerId),
            lastStand: gameServiceFactory.lastStand(),
            gameConfig
        });
    }

    function playerLastStand(playerId) {
        return PlayerLastStand({
            playerId,
            matchService: api.matchService(),
            playerTurnControl: api.turnControl(playerId),
            opponentTurnControl: api.turnControl(api.opponentId(playerId))
        });
    }

    function turnControl(playerId) {
        return new TurnControl({
            matchService: api.matchService(),
            lastStand: gameServiceFactory.lastStand(),
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(api.opponentId(playerId)),
            playerPhase: api.playerPhase(playerId),
            playerGameTimer: api.gameTimer(playerId),
            opponentPhase: api.playerPhase(api.opponentId(playerId)),
            opponentActionLog: api.actionLog(api.opponentId(playerId)),
            opponentGameTimer: api.gameTimer(api.opponentId(playerId))
        });
    }

    function queryEvents(playerId) {
        return new ServerQueryEvents({ playerId, matchService: api.matchService() });
    }

    function sacrificeCard(playerId) {
        return SacrificeCard({
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(api.opponentId(playerId)),
            opponentActionLog: api.actionLog(api.opponentId(playerId))
        });
    }

    function actionLog(playerId) {
        return ActionLog({
            matchService: api.matchService(),
            playerStateService: api.playerStateService(playerId),
            cardInfoRepository: gameServiceFactory.cardInfoRepository(),
            userRepository
        });
    }

    function queryAttacks(playerId) {
        const opponentId = api.opponentId(playerId);
        return QueryAttacks({
            opponentStateService: api.playerStateService(opponentId),
            playerEventRepository: api.eventRepository(playerId),
            opponentEventRepository: api.eventRepository(opponentId)
        })
    }

    function startGame(playerId) {
        const opponentId = api.opponentId(playerId);
        return StartGame({
            matchService: api.matchService(),
            playerStateService: api.playerStateService(playerId),
            playerRequirementService: api.playerRequirementService(playerId),
            opponentStateService: api.playerStateService(opponentId),
            opponentRequirementService: api.playerRequirementService(opponentId),
            playerPhase: api.playerPhase(playerId),
            opponentPhase: api.playerPhase(opponentId),
            playerRuleService: api.playerRuleService(playerId),
            canTheOpponent: api.canThePlayer(opponentId)
        });
    }

    function gameTimer(playerId) {
        return GameTimer({
            playerClock: api.clock(playerId),
            opponentClock: api.clock(api.opponentId(playerId))
        });
    }

    function clock(playerId) {
        return Clock({
            playerStateService: api.playerStateService(playerId)
        });
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
            deckFactory: gameServiceFactory.deckFactory(),
            logger
        });
    }

    function playerRuleService(playerId) {
        return new PlayerRuleService({
            matchService: api.matchService(),
            playerStateService: api.playerStateService(playerId),
            opponentStateService: api.playerStateService(playerId),
            playerRequirementService: api.playerRequirementService(playerId),
            canThePlayer: api.canThePlayer(playerId),
            canTheOpponent: api.canThePlayer(api.opponentId(playerId)),
            turnControl: api.turnControl(playerId),
            playerPhase: api.playerPhase(playerId),
            playerCommanders: api.playerCommanders(playerId),
            queryEvents: api.queryEvents(playerId),
            gameConfig
        });
    }

    function matchService() {
        const matchService = new MatchService({ endMatch, gameConfig });
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

const PlayerPhase = require("./PlayerPhase.js");
const MatchService = require("./MatchService.js");
const TurnControl = require("./TurnControl.js");
const SourceFetcher = require("./requirement/SourceFetcher.js");
const CanThePlayer = require("./CanThePlayer.js");
const ServerQueryEvents = require("../../server/match/ServerQueryEvents.js");
const EventRepository = require("../event/EventRepository2.js");
const PlayerServiceProvider = require("./PlayerServiceProvider.js");
const PlayerStateService = require("./PlayerStateService.js");
const CardFactory = require("../card/CardFactory.js");
const EventFactory = require("../event/EventFactory.js");
const PlayerRequirementService = require("./requirement/PlayerRequirementService.js");
const PlayerRequirementFactory = require("./requirement/PlayerRequirementFactory.js");
const PlayerRuleService = require("./PlayerRuleService.js");
const PlayerPerfectPlan = require("./perfectPlan/PlayerPerfectPlan.js");
const QueryAttacks = require("./requirement/QueryAttacks.js");
const OverworkEventFactory = require("./overwork/event/OverworkEventFactory.js");
const ActionPointsForDrawExtraCardEventFactory = require("./ActionPointsForDrawExtraCard/event/ActionPointsForDrawExtraCardEventFactory.js");
const PlayerOverwork = require("./overwork/PlayerOverwork.js");
const FindAcidProjectile = require("./commander/FindAcidProjectile.js");
const FindDronesForZuuls = require("./commander/FindDronesForZuuls.js");
const NaaloxDormantEffect = require("./commander/NaaloxDormantEffect");
const MoveStationCard = require("./MoveStationCard.js");
const AddRequirementFromSpec = require("./requirement/AddRequirementFromSpec.js");
const StartGame = require("./StartGame.js");
const ActionLog = require("./log/ActionLog.js");
const SacrificeCard = require("./SacrificeCard.js");
const Repair = require("./Repair.js");
const Miller = require("./mill/Miller.js");
const PlayerCommanders = require("./commander/PlayerCommanders.js");
const Clock = require("../gameTimer/Clock.js");
const PlayerGameTimer = require("../gameTimer/PlayerGameTimer.js");
const PlayerPhaseControl = require("./PlayerPhaseControl.js");
const PlayerNextPhase = require("./PlayerNextPhase.js");
const PlayerDiscardPhase = require("./PlayerDiscardPhase.js");
const PlayerStationAttacker = require("../PlayerStationAttacker.js");
const PlayerLastStand = require("./PlayerLastStand.js");
const PlayerDrawPhase = require("./PlayerDrawPhase.js");
const CountCardsLeftToDrawForDrawPhase = require("./rules/CountCardsLeftToDrawForDrawPhase.js");
const MoreCardsCanBeDrawnForDrawPhase = require("./rules/MoreCardsCanBeDrawnForDrawPhase.js");
const QueryPlayerRequirements = require("./requirement/QueryPlayerRequirements.js");
const PlayerActionPointsCalculator = require("./PlayerActionPointsCalculator.js");
const PlayerDeck = require("./PlayerDeck.js");
const QueryBoard = require("./QueryBoard.js");
const ServiceTypes = PlayerServiceProvider.TYPE;

module.exports = function ({
  state,
  logger,
  endMatch,
  gameConfig,
  actionPointsCalculator,
  gameServiceFactory,
  userRepository,
}) {
  const objectsByNameAndPlayerId = {};

  let playerServiceProvider;

  const api = {
    _cache: objectsByNameAndPlayerId,
    playerServiceProvider: () => playerServiceProvider,
    countCardsLeftToDrawForDrawPhase: cached(countCardsLeftToDrawForDrawPhase),
    moreCardsCanBeDrawnForDrawPhase: cached(moreCardsCanBeDrawnForDrawPhase),
    playerStationAttacker: cached(playerStationAttacker),
    playerPhaseControl: cached(playerPhaseControl),
    playerDiscardPhase: cached(playerDiscardPhase),
    playerDrawPhase: cached(playerDrawPhase),
    playerNextPhase: cached(playerNextPhase),
    playerCommanders: cached(playerCommanders),
    miller: cached(miller),
    repair: cached(repair),
    moveStationCard: cached(moveStationCard),
    playerOverwork: cached(playerOverwork),
    playerPerfectPlan: cached(playerPerfectPlan),
    findAcidProjectile: cached(findAcidProjectile),
    findDronesForZuuls: cached(findDronesForZuuls),
    naaloxDormantEffect: cached(naaloxDormantEffect),
    overworkEventFactory: cached(overworkEventFactory),
    actionPointsForDrawExtraCardEventFactory: cached(actionPointsForDrawExtraCardEventFactory),
    cardFactory: cached(cardFactory),
    matchService: cached(matchService),
    queryAttacks: cached(queryAttacks),
    startGame: cached(startGame),
    playerGameTimer: cached(playerGameTimer),
    clock: cached(clock),
    playerDeck: cached(playerDeck),
    playerStateService: cached(playerStateService),
    addRequirementFromSpec: cached(addRequirementFromSpec),
    playerRequirementService: cached(playerRequirementService),
    queryPlayerRequirements: cached(queryPlayerRequirements),
    playerRuleService: cached(playerRuleService),
    playerPhase: cached(playerPhase),
    playerLastStand: cached(playerLastStand),
    turnControl: cached(turnControl),
    playerRequirementFactory: cached(playerRequirementFactory),
    canThePlayer: cached(canThePlayer),
    sourceFetcher: cached(sourceFetcher),
    eventRepository: cached(eventRepository),
    eventFactory: cached(eventFactory),
    opponentId: cached((playerId) =>
      api.matchService().getOpponentId(playerId)
    ),
    queryEvents: cached(queryEvents),
    sacrificeCard: cached(sacrificeCard),
    actionLog: cached(actionLog),
    playerActionPointsCalculator: cached(playerActionPointsCalculator),
    queryBoard: cached(queryBoard),
    actionPointsCalculator: () => actionPointsCalculator,
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

      throw new Error("Cannot find a player service for type: " + type);
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
    },
  };

  return api;

  function moreCardsCanBeDrawnForDrawPhase(playerId) {
    return MoreCardsCanBeDrawnForDrawPhase({
      playerPhase: api.playerPhase(playerId),
      countCardsLeftToDrawForDrawPhase: api.countCardsLeftToDrawForDrawPhase(
        playerId
      ),
    });
  }

  function countCardsLeftToDrawForDrawPhase(playerId) {
    return CountCardsLeftToDrawForDrawPhase({
      matchService: api.matchService(),
      queryEvents: api.queryEvents(playerId),
      playerStateService: api.playerStateService(playerId),
    });
  }

  function playerStationAttacker(playerId) {
    return PlayerStationAttacker({
      matchService: api.matchService(),
      stateSerializer: gameServiceFactory.stateSerializer(),
      gameActionTimeMachine: gameServiceFactory.gameActionTimeMachine(),
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
      playerGameTimer: api.playerGameTimer(playerId),
      playerDiscardPhase: api.playerDiscardPhase(playerId),
      addRequirementFromSpec: api.addRequirementFromSpec(playerId),
      opponentStateService: api.playerStateService(api.opponentId(playerId)),
      opponentRequirementService: api.playerRequirementService(
        api.opponentId(playerId)
      ),
    });
  }

  function playerDiscardPhase(playerId) {
    return PlayerDiscardPhase({
      playerRuleService: api.playerRuleService(playerId),
      playerStateService: api.playerStateService(playerId),
    });
  }

  function playerDrawPhase(playerId) {
    return PlayerDrawPhase({
      miller: api.miller(playerId),
      moreCardsCanBeDrawnForDrawPhase: api.moreCardsCanBeDrawnForDrawPhase(
        playerId
      ),
      playerDeck: api.playerDeck(playerId),
      playerPhase: api.playerPhase(playerId),
    });
  }

  function playerCommanders(playerId) {
    return PlayerCommanders({
      playerStateService: api.playerStateService(playerId),
    });
  }

  function miller(playerId) {
    return Miller({
      queryPlayerRequirements: api.queryPlayerRequirements(playerId),
      playerStateService: api.playerStateService(playerId),
      playerCommanders: api.playerCommanders(playerId),
      playerRuleService: api.playerRuleService(playerId),
      opponentStateService: api.playerStateService(api.opponentId(playerId)),
      opponentActionLog: api.actionLog(api.opponentId(playerId)),
    });
  }

  function repair(playerId) {
    return Repair({
      matchService: api.matchService(),
      playerStateService: api.playerStateService(playerId),
      opponentActionLog: api.actionLog(api.opponentId(playerId)),
    });
  }

  function moveStationCard(playerId) {
    return MoveStationCard({
      matchService: api.matchService(),
      playerStateService: api.playerStateService(playerId),
      playerPhase: api.playerPhase(playerId),
      opponentActionLog: api.actionLog(api.opponentId(playerId)),
      playerCommanders: api.playerCommanders(playerId),
    });
  }

  function playerOverwork(playerId) {
    return PlayerOverwork({
      matchService: api.matchService(),
      overworkEventFactory: api.overworkEventFactory(playerId),
      playerStateService: api.playerStateService(playerId),
      playerRequirementService: api.playerRequirementService(playerId),
      queryPlayerRequirements: api.queryPlayerRequirements(playerId),
      opponentRequirementService: api.playerRequirementService(
        api.opponentId(playerId)
      ),
      opponentActionLog: api.actionLog(api.opponentId(playerId)),
      playerCommanders: api.playerCommanders(playerId),
    });
  }

  function findAcidProjectile(playerId) {
    return new FindAcidProjectile({
      playerStateService: api.playerStateService(playerId),
      playerPhase: api.playerPhase(playerId),
      playerActionPointsCalculator: api.playerActionPointsCalculator(playerId),
      addRequirementFromSpec: api.addRequirementFromSpec(playerId),
      opponentActionLog: api.actionLog(api.opponentId(playerId)),
      playerRequirementFactory: api.playerRequirementFactory(playerId),
      playerRequirementService: api.playerRequirementService(playerId),
      matchService: api.matchService(playerId),
    });
  }

  function findDronesForZuuls(playerId) {
    return new FindDronesForZuuls({
      playerStateService: api.playerStateService(playerId),
      playerPhase: api.playerPhase(playerId),
      playerActionPointsCalculator: api.playerActionPointsCalculator(playerId),
      addRequirementFromSpec: api.addRequirementFromSpec(playerId),
      opponentActionLog: api.actionLog(api.opponentId(playerId)),
      playerActionLog: api.actionLog(playerId),
      matchService: api.matchService(playerId),
    });
  }

  function naaloxDormantEffect(playerId) {
    return new NaaloxDormantEffect({
      playerStateService: api.playerStateService(playerId),
      playerActionPointsCalculator: api.playerActionPointsCalculator(playerId),
      addRequirementFromSpec: api.addRequirementFromSpec(playerId),
      playerPhase: api.playerPhase(playerId),
      matchService: api.matchService(playerId),
      opponentActionLog: api.actionLog(api.opponentId(playerId)),
      playerActionLog: api.actionLog(playerId),
    });
  }

  function playerPerfectPlan(playerId) {
    return PlayerPerfectPlan({
      playerPhase: api.playerPhase(playerId),
      overworkEventFactory: api.overworkEventFactory(playerId),
      playerStateService: api.playerStateService(playerId),
      queryPlayerRequirements: api.queryPlayerRequirements(playerId),
      playerRequirementService: api.playerRequirementService(playerId),
      opponentRequirementService: api.playerRequirementService(
        api.opponentId(playerId)
      ),
      opponentActionLog: api.actionLog(api.opponentId(playerId)),
      playerCommanders: api.playerCommanders(playerId),
      addRequirementFromSpec: api.addRequirementFromSpec(playerId),
    });
  }

  function overworkEventFactory(playerId) {
    return OverworkEventFactory({
      matchService: api.matchService(),
      playerStateService: api.playerStateService(playerId),
    });
  }

  function actionPointsForDrawExtraCardEventFactory(playerId) {
    return ActionPointsForDrawExtraCardEventFactory({
      matchService: api.matchService(),
      playerStateService: api.playerStateService(playerId),
    });
  }

  function playerPhase(playerId) {
    return new PlayerPhase({
      matchService: api.matchService(),
      playerStateService: api.playerStateService(playerId),
      opponentStateService: api.playerStateService(api.opponentId(playerId)),
    });
  }

  function eventRepository(playerId) {
    return EventRepository({
      playerStateService: api.playerStateService(playerId),
    });
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
      opponentRequirementFactory: api.playerRequirementFactory(opponentId),
    });
  }

  function playerRequirementService(playerId) {
    const opponentId = api.opponentId(playerId);
    return PlayerRequirementService({
      playerStateService: api.playerStateService(playerId),
      opponentStateService: api.playerStateService(opponentId),
      playerCommanders: api.playerCommanders(playerId),
      moreCardsCanBeDrawnForDrawPhase: api.moreCardsCanBeDrawnForDrawPhase(
        playerId
      ),
      queryPlayerRequirements: api.queryPlayerRequirements(playerId),
    });
  }

  function queryPlayerRequirements(playerId) {
    return QueryPlayerRequirements({
      playerStateService: api.playerStateService(playerId),
      opponentStateService: api.playerStateService(api.opponentId(playerId)),
      playerCommanders: api.playerCommanders(playerId),
      moreCardsCanBeDrawnForDrawPhase: api.moreCardsCanBeDrawnForDrawPhase(
        playerId
      ),
    });
  }

  function playerRequirementFactory(playerId) {
    return PlayerRequirementFactory({
      sourceFetcher: api.sourceFetcher(playerId),
      queryAttacks: api.queryAttacks(playerId),
      opponentStateService: api.playerStateService(api.opponentId(playerId)),
      playerStateService: api.playerStateService(playerId),
    });
  }

  function sourceFetcher(playerId) {
    return SourceFetcher({
      playerStateService: api.playerStateService(playerId),
      opponentStateService: api.playerStateService(api.opponentId(playerId)),
      canThePlayer: api.canThePlayer(playerId),
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
      playerActionPointsCalculator: api.playerActionPointsCalculator(playerId),
      gameConfig,
    });
  }

  function playerLastStand(playerId) {
    return PlayerLastStand({
      playerId,
      matchService: api.matchService(),
      playerTurnControl: api.turnControl(playerId),
      opponentTurnControl: api.turnControl(api.opponentId(playerId)),
      playerStateService: api.playerStateService(playerId),
      queryPlayerRequirements: api.queryPlayerRequirements(playerId),
    });
  }

  function turnControl(playerId) {
    return new TurnControl({
      matchService: api.matchService(),
      lastStand: gameServiceFactory.lastStand(),
      playerStateService: api.playerStateService(playerId),
      opponentStateService: api.playerStateService(api.opponentId(playerId)),
      playerPhase: api.playerPhase(playerId),
      playerGameTimer: api.playerGameTimer(playerId),
      opponentPhase: api.playerPhase(api.opponentId(playerId)),
      opponentActionLog: api.actionLog(api.opponentId(playerId)),
    });
  }

  function queryEvents(playerId) {
    return new ServerQueryEvents({
      playerId,
      matchService: api.matchService(),
    });
  }

  function sacrificeCard(playerId) {
    return SacrificeCard({
      playerStateService: api.playerStateService(playerId),
      opponentStateService: api.playerStateService(api.opponentId(playerId)),
      opponentActionLog: api.actionLog(api.opponentId(playerId)),
    });
  }

  function actionLog(playerId) {
    return ActionLog({
      matchService: api.matchService(),
      playerStateService: api.playerStateService(playerId),
      cardInfoRepository: gameServiceFactory.cardInfoRepository(),
      userRepository,
    });
  }

  function playerActionPointsCalculator(playerId) {
    return PlayerActionPointsCalculator({
      actionPointsCalculator: gameServiceFactory.actionPointsCalculator(),
      playerPhase: api.playerPhase(playerId),
      eventRepository: api.eventRepository(playerId),
      playerStateService: api.playerStateService(playerId),
      matchService: gameServiceFactory.matchService(),
    });
  }

  function queryBoard(playerId) {
    return new QueryBoard({
      opponentStateService: api.playerStateService(api.opponentId(playerId)),
      playerStateService: api.playerStateService(playerId),
      canThePlayer: api.canThePlayer(playerId),
      queryAttacks: api.queryAttacks(playerId),
    });
  }

  function queryAttacks(playerId) {
    const opponentId = api.opponentId(playerId);
    return QueryAttacks({
      gameConfig,
      playerTurnControl: api.turnControl(playerId),
      opponentStateService: api.playerStateService(opponentId),
      playerEventRepository: api.eventRepository(playerId),
      opponentEventRepository: api.eventRepository(opponentId),
      getCurrentTime: () => Date.now(),
    });
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
      canTheOpponent: api.canThePlayer(opponentId),
      playerCommanders: api.playerCommanders(playerId),
      playerActionLog: api.actionLog(playerId),
      opponentActionLog: api.actionLog(opponentId),
      gameConfig,
    });
  }

  function playerGameTimer(playerId) {
    return PlayerGameTimer({
      playerClock: api.clock(playerId),
      opponentClock: api.clock(api.opponentId(playerId)),
    });
  }

  function clock(playerId) {
    return Clock({
      playerStateService: api.playerStateService(playerId),
    });
  }

  function playerDeck(playerId) {
    return PlayerDeck({
      playerStateService: api.playerStateService(playerId),
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
      logger,
    });
  }

  function playerRuleService(playerId) {
    return new PlayerRuleService({
      matchService: api.matchService(),
      playerStateService: api.playerStateService(playerId),
      opponentStateService: api.playerStateService(api.opponentId(playerId)),
      queryPlayerRequirements: api.queryPlayerRequirements(playerId),
      playerRequirementService: api.playerRequirementService(playerId),
      canThePlayer: api.canThePlayer(playerId),
      canTheOpponent: api.canThePlayer(api.opponentId(playerId)),
      turnControl: api.turnControl(playerId),
      playerPhase: api.playerPhase(playerId),
      playerCommanders: api.playerCommanders(playerId),
      queryEvents: api.queryEvents(playerId),
      countCardsLeftToDrawForDrawPhase: api.countCardsLeftToDrawForDrawPhase(
        playerId
      ),
      moreCardsCanBeDrawnForDrawPhase: api.moreCardsCanBeDrawnForDrawPhase(
        playerId
      ),
      gameConfig,
    });
  }

  function matchService() {
    return gameServiceFactory.matchService();
  }

  function cached(constructor) {
    const name = constructor.name;
    return (playerIdOrUndefined) => {
      const key = name + ":" + playerIdOrUndefined;
      const existingCopy = objectsByNameAndPlayerId[key];
      if (existingCopy) return existingCopy;

      const result = constructor(playerIdOrUndefined);
      objectsByNameAndPlayerId[key] = result;
      return result;
    };
  }
};

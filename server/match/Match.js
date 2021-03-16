const ActionPointsCalculator = require("../../shared/match/ActionPointsCalculator.js");
const FindCardController = require("./controller/FindCardController.js");
const SacrificeCardForRequirementController = require("./controller/SacrificeCardForRequirementController.js");
const DrawCardController = require("./controller/DrawCardController.js");
const AttackController = require("./controller/AttackController.js");
const DebugController = require("./DebugController.js");
const MoveCardController = require("./controller/MoveCardController.js");
const PutDownCardController = require("./controller/PutDownCardController.js");
const DiscardCardController = require("./controller/DiscardCardController.js");
const NextPhaseController = require("./controller/NextPhaseController.js");
const StartGameController = require("./controller/StartGameController.js");
const OverworkController = require("./controller/OverworkController.js");
const ActionPointsForDrawExtraCardController = require("./controller/ActionPointsForDrawExtraCardController.js");
const PerfectPlanController = require("./controller/PerfectPlanController.js");
const FindAcidProjectile = require("./controller/FindAcidProjectileController.js");
const FindDronesForZuulsController = require("./controller/FindDronesForZuulsController.js");
const NaaloxDormantEffectController = require("./controller/NaaloxDormantEffectController.js");
const TriggerDormantEffect = require("./command/TriggerDormantEffect.js");
const LookAtStationRowCommand = require("./command/LookAtStationRowCommand.js");
const CancelRequirementCommand = require("./command/CancelRequirementCommand.js");
const CheatController = require("./controller/CheatController.js");
const MatchComService = require("./service/MatchComService.js");
const PlayerRequirementUpdaterFactory = require("./PlayerRequirementUpdaterFactory.js");
const StateChangeListener = require("../../shared/match/StateChangeListener.js");
const ActionPointsForDrawExtraCardEventFactory = require("../../shared/match/ActionPointsForDrawExtraCard/event/ActionPointsForDrawExtraCardEventFactory.js");
const PlayerOverworkFactory = require("../../shared/match/overwork/PlayerOverworkFactory.js");
const ServiceFactoryFactory = require("../../shared/match/ServiceFactoryFactory.js");
const LookAtStationRow = require("../../shared/match/card/actions/LookAtStationRow.js");
const PlayerInactivityService = require("./service/PlayerInactivityService.js");
const CardsThatCanLookAtHandSizeStationRow = require("../../shared/match/card/query/CardsThatCanLookAtHandSizeStationRow.js");
const CardCanLookAtHandSizeStationRow = require("../../shared/match/card/query/CardCanLookAtHandSizeStationRow.js");
const CreatePlayerRequirementUpdater = require("../../shared/match/requirement/CreatePlayerRequirementUpdater.js");
const MatchMode = require("../../shared/match/MatchMode.js");
const { PHASES } = require("../../shared/phases.js");
const { inspect } = require("util");

module.exports = function ({
  players,
  matchId,
  cardInfoRepository,
  logger,
  rawCardDataRepository,
  endMatch,
  gameConfig,
  actionPointsCalculator = ActionPointsCalculator({ cardInfoRepository }),
  registerLogGame,
}) {
  const state = createMatchState({
    matchId,
    playerIds: players.map((p) => p.id),
    firstPlayerId: randomItem(players.map((p) => p.id)),
  });

  const serviceFactoryFactory = ServiceFactoryFactory({
    state,
    players,
    gameConfig,
    rawCardDataRepository,
    cardInfoRepository,
    actionPointsCalculator,
    endMatch,
    logger,
    registerLogGame,
  });

  const gameServiceFactory = serviceFactoryFactory.gameServiceFactory();
  const playerServiceFactory = serviceFactoryFactory.playerServiceFactory();
  const playerCardServicesFactory = serviceFactoryFactory.playerCardServicesFactory();
  const playerRequirementServicesFactory = serviceFactoryFactory.playerRequirementServicesFactory();
  const CardFacade = serviceFactoryFactory.cardFacadeContext();
  const matchService = playerServiceFactory.matchService();
  const playerServiceProvider = playerServiceFactory.playerServiceProvider();
  const stateChangeListener = new StateChangeListener({
    playerServiceProvider,
    matchService,
    logger,
  });
  const matchComService = new MatchComService({
    players,
    logger,
    matchService,
    playerServiceProvider,
    playerServiceFactory,
    gameServiceFactory,
    stateChangeListener,
  });

  const playerInactivityService = new PlayerInactivityService({
    gameConfig,
    matchService,
    matchComService,
    logger,
    retreat,
  });

  const playerRequirementUpdaterFactory = new PlayerRequirementUpdaterFactory({
    playerServiceProvider,
    matchService,
    playerServiceFactory,
    playerRequirementServicesFactory,
  });
  const playerOverworkFactory = PlayerOverworkFactory({ playerServiceFactory });

  const stateSerializer = gameServiceFactory.stateSerializer();

  const actionPointsForDrawExtraCardEventFactory = ActionPointsForDrawExtraCardEventFactory({matchService, playerServiceFactory})
  const controllerDeps = {
    logger,
    matchService,
    matchComService,
    restoreFromState,
    playerServiceProvider,
    cardFactory: playerServiceFactory.cardFactory(),
    stateChangeListener,
    playerRequirementUpdaterFactory,
    rawCardDataRepository,
    playerOverworkFactory,
    stateSerializer,
    CardFacade,
    playerServiceFactory,
    playerRequirementServicesFactory,
    playerCardServicesFactory,
    gameActionTimeMachine: gameServiceFactory.gameActionTimeMachine(),
    gameConfig,
    actionPointsForDrawExtraCardEventFactory,
  };

  const debugController = DebugController(controllerDeps);
  const cheatController = CheatController(controllerDeps);
  const drawCardController = DrawCardController(controllerDeps);
  const findCardController = FindCardController(controllerDeps);
  const sacrificeCardForRequirementController = SacrificeCardForRequirementController(
    controllerDeps
  );
  const attackController = AttackController(controllerDeps);
  const moveCardController = MoveCardController(controllerDeps);
  const putDownCardController = PutDownCardController(controllerDeps);
  const discardCardController = DiscardCardController(controllerDeps);
  const nextPhaseController = NextPhaseController(controllerDeps);
  const startGameController = StartGameController(controllerDeps);
  const overworkController = OverworkController(controllerDeps);
  const actionPointsForDrawExtraCardController = ActionPointsForDrawExtraCardController(controllerDeps);
  const perfectPlanController = PerfectPlanController(controllerDeps);
  const findAcidProjectileController = FindAcidProjectile(controllerDeps);
  const findDronesForZuulsController = FindDronesForZuulsController(
    controllerDeps
  );
  const naaloxDormantEffectController = NaaloxDormantEffectController(
    controllerDeps
  );
  const api = {
    selectPlayerToStart: startGameController.selectPlayerToStart,
    selectCommander: startGameController.selectCommander,
    nextPhase: nextPhaseController.onNextPhase,
    passDrawPhase: nextPhaseController.passDrawPhase,
    toggleControlOfTurn: nextPhaseController.onToggleControlOfTurn,
    playerReady: nextPhaseController.playerReady,
    putDownCard: putDownCardController.onPutDownCard,
    selectStartingStationCard: startGameController.selectStartingStationCard,
    counterCard: putDownCardController.counterCard,
    cancelCounterCard: putDownCardController.cancelCounterCard,
    drawCard: drawCardController.onDrawCard,
    skipDrawCard: drawCardController.skipDrawCard,
    discardOpponentTopTwoCards: drawCardController.onDiscardOpponentTopTwoCards,
    discardCard: discardCardController.onDiscardCard,
    discardDurationCard,
    moveCard: moveCardController.onMoveCard,
    moveStationCard: moveCardController.moveStationCard,
    attack: attackController.onAttack,
    counterAttack: attackController.counterAttack,
    cancelCounterAttack: attackController.cancelCounterAttack,
    attackStationCard: attackController.onAttackStationCards, // TODO Rename attackStationCards (pluralized),
    sacrifice: attackController.onSacrifice,
    damageStationCards: attackController.onDamageStationCard,
    damageShieldCards: attackController.onDamageShieldCard,
    selectCardForFindCardRequirement: findCardController.onSelectCard,
    sacrificeCardForRequirement:
      sacrificeCardForRequirementController.onSelectCard,
    cancelRequirement: PlayerCommand(CancelRequirementCommand, controllerDeps),
    overwork: overworkController.overwork,
    actionPointsForDrawExtraCard: actionPointsForDrawExtraCardController.actionPointsForDrawExtraCard,
    perfectPlan: perfectPlanController.perfectPlan,
    triggerDormantEffect: PlayerCommand(TriggerDormantEffect, controllerDeps),
    lookAtStationRow: PlayerCommand(LookAtStationRowCommand, controllerDeps),
    findAcidProjectile: findAcidProjectileController.findAcidProjectile,
    findDronesForZuuls: findDronesForZuulsController.findDronesForZuuls,
    naaloxRepairStationCard:
      naaloxDormantEffectController.naaloxRepairStationCard,
    naaloxReviveDrone: naaloxDormantEffectController.naaloxReviveDrone,
    endLastStand,
    repairCard,
    retreat,
    restoreSavedMatch: debugController.onRestoreSavedMatch,
    cheat: cheatController.onCheat,
    damageStarship: attackController.damageStarship,
  };

  return {
    get id() {
      return matchService.matchId();
    },
    get matchId() {
      return matchService.matchId();
    },
    get players() {
      return matchComService.getPlayers();
    },
    playerIds() {
      return matchService.getPlayerIds();
    },
    start: startGameController.start,
    refresh,
    getOwnState: getPlayerState,
    restoreFromState,
    getRestorableState,
    restoreFromRestorableState,
    toClientModel,
    hasEnded,
    saveMatch: debugController.onSaveMatch,
    updatePlayer: matchComService.updatePlayer.bind(matchComService),
    timeAlive: debugController.timeAlive,
    checkLastTimeOfInactivityForPlayer:
      playerInactivityService.checkLastTimeOfInactivityForPlayer,
    _actionPointForPlayer,
    ...wrapApi({ api, matchComService, stateChangeListener }),
  };

  function refresh(playerId) {
    startGameController.repairPotentiallyInconsistentState(playerId);
    matchComService.emitCurrentStateToPlayers();
  }

  function discardDurationCard(playerId, cardId) {
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );

    if (playerStateService.getPhase() !== PHASES.preparation) {
      throw CheatError(
        "Cannot discard duration cards after turn your has started"
      );
    }
    playerStateService.removeAndDiscardCardFromStationOrZone(cardId);
  }

  function repairCard(playerId, { repairerCardId, cardToRepairId }) {
    const playerStateService = playerServiceProvider.getStateServiceById(
      playerId
    );
    const cardFactory = playerServiceFactory.cardFactory();

    const repairerCardData = playerStateService.findCard(repairerCardId);
    const repairerCard = cardFactory.createCardForPlayer(
      repairerCardData,
      playerId
    );
    if (!repairerCard.canRepair()) throw CheatError("Cannot repair");

    const cardToRepair = playerStateService.createBehaviourCardById(
      cardToRepairId
    );
    if (!repairerCard.canRepairCard(cardToRepair))
      throw CheatError("Cannot repair");

    const repair = playerServiceFactory.repair(playerId);
    repair.cardOrStationCard(repairerCardId, cardToRepairId);
  }

  function endLastStand() {
    const lastStand = gameServiceFactory.lastStand();
    if (lastStand.hasEnded()) {
      matchComService.emitCurrentStateToPlayers();
    }
  }

  function retreat(playerId) {
    matchService.playerRetreat(playerId);
    matchComService.emitCurrentStateToPlayers();
  }

  function logError(error) {
    const rawErrorMessage = JSON.stringify(inspect(error), null, 4);
    const errorMessage = `(${new Date().toISOString()}) Error in action to match: ${
      error.message
    } - RAW ERROR: ${rawErrorMessage}`;
    logger.log(errorMessage, "error");
  }

  function getPlayerState(playerId) {
    return state.playerStateById[playerId];
  }

  function restoreFromState(restoreState) {
    for (const key of Object.keys(restoreState)) {
      state[key] = restoreState[key];
      matchService.setState(state);
    }

    state.playersConnected = 2;
  }

  function getRestorableState() {
    return gameServiceFactory.matchRestorer().getRestorableState();
  }

  function restoreFromRestorableState(restorableStateJson) {
    return gameServiceFactory
      .matchRestorer()
      .restoreFromRestorableState({ restorableStateJson });
  }

  function toClientModel() {
    const players = matchComService.getPlayers();
    return {
      playerIds: players.map((p) => p.id),
      id: matchService.matchId(),
    };
  }

  function hasEnded() {
    return state.ended;
  }

  function _actionPointForPlayer(playerId) {
    return playerServiceFactory
      .playerActionPointsCalculator(playerId)
      .calculate();
  }
};

function wrapApi({ api, matchComService, stateChangeListener }) {
  const wrappedApi = {};
  for (const name of Object.keys(api)) {
    if (typeof api[name] === "function") {
      wrappedApi[name] = (...args) => {
        //WARNING: For some reason "callEnded" was not always setting its flag to false before the next call runs ".snapshot".
        // So this was added and it fixed the bug. But it would be nice to know _why_ in the future!
        matchComService.callStarted();
        //END OF WARNING

        let result;
        try {
          result = api[name](...args);
          stateChangeListener.snapshot();
        } finally {
          //WARNING: See related warning about ".callStarted". If it no longer exists, delete this warning.
          matchComService.callEnded();
          //END OF WARNING
        }

        return result;
      };
    } else {
      wrappedApi[name] = api[name];
    }
  }
  return wrappedApi;
}

function CheatError(reason) {
  const error = new Error(reason);
  error.message = reason;
  error.type = "CheatDetected";
  return error;
}

function PlayerCommand(Command, deps) {
  return (playerId, ...args) => {
    const playerServiceFactory = deps.playerServiceFactory;
    const playerRequirementServicesFactory =
      deps.playerRequirementServicesFactory;
    const playerCardServicesFactory = deps.playerCardServicesFactory;
    const command = Command({
      matchService: deps.matchService,
      playerStateService: playerServiceFactory.playerStateService(playerId),
      canThePlayer: playerServiceFactory.canThePlayer(playerId),
      lookAtStationRow: lookAtStationRow(playerId),
      playerCardFactory: playerCardServicesFactory.playerCardFactory(playerId),
      createPlayerRequirementUpdater: CreatePlayerRequirementUpdater({
        playerStateService: playerServiceFactory.playerStateService(playerId),
        playerRequirementService: playerServiceFactory.playerRequirementService(
          playerId
        ),
        opponentRequirementService: playerServiceFactory.playerRequirementService(
          playerServiceFactory.opponentId(playerId)
        ),
        addRequirementFromSpec: playerServiceFactory.addRequirementFromSpec(
          playerId
        ),
        cardFactory: playerServiceFactory.cardFactory(),
      }),
    });
    return command(...args);

    function lookAtStationRow(playerId) {
      return LookAtStationRow({
        cardsThatCanLookAtHandSizeStationRow: CardsThatCanLookAtHandSizeStationRow(
          {
            playerStateService: playerServiceFactory.playerStateService(
              playerId
            ),
          }
        ),
        cardCanLookAtHandSizeStationRow: CardCanLookAtHandSizeStationRow({
          cardsThatCanLookAtHandSizeStationRow: CardsThatCanLookAtHandSizeStationRow(
            {
              playerStateService: playerServiceFactory.playerStateService(
                playerId
              ),
            }
          ),
        }),
        addRequirementFromSpec: playerServiceFactory.addRequirementFromSpec(
          playerId
        ),
        canAddRequirementFromSpec: playerRequirementServicesFactory.canAddRequirementFromSpec(
          playerId
        ),
      });
    }
  };
}

function createMatchState({ firstPlayerId, playerIds, matchId }) {
  return {
    matchId,
    mode: MatchMode.firstMode,
    gameStartTime: Date.now(),
    turn: 1,
    currentPlayer: firstPlayerId,
    playerOrder: [firstPlayerId, playerIds.find((id) => id !== firstPlayerId)],
    playersConnected: 0,
    readyPlayerIds: [],
    ended: false,
    retreatedPlayerId: null,
    lastStandInfo: null,
    playerStateById: {},
    deckIdByPlayerId: {},
    customDeckByPlayerId: {},
  };
}

function randomItem(collection) {
  return collection[Math.round(Math.random() * (collection.length - 1))];
}

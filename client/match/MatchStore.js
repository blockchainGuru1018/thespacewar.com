const DiscardCardEvent = require("../../shared/event/DiscardCardEvent.js");
const AttackEvent = require("../../shared/event/AttackEvent.js");
const QueryEvents = require("../../shared/event/QueryEvents.js");
const ActionPointsCalculator = require("../../shared/match/ActionPointsCalculator.js");
const MatchService = require("../../shared/match/MatchService.js");
const CanThePlayer = require("../../shared/match/CanThePlayer.js");
const TurnControl = require("../../shared/match/TurnControl.js");
const PlayerPhase = require("../../shared/match/PlayerPhase.js");
const PlayerRuleService = require("../../shared/match/PlayerRuleService.js");
const ClientPlayerStateService = require("./ClientPlayerStateService");
const QueryPlayerRequirements = require("../../shared/match/requirement/QueryPlayerRequirements.js");
const PlayerRequirementService = require("../../shared/match/requirement/PlayerRequirementService.js");
const PlayerPerfectPlan = require("../../shared/match/perfectPlan/PlayerPerfectPlan.js");
const FindAcidProjectile = require("../../shared/match/commander/FindAcidProjectile.js");
const FindDronesForZuuls = require("../../shared/match/commander/FindDronesForZuuls.js");
const NaaloxDormantEffect = require("../../shared/match/commander/NaaloxDormantEffect");
const CardFactory = require("../../shared/card/CardFactory.js");
const ClientPlayerServiceProvider = require("./ClientPlayerServiceProvider.js");
const EventFactory = require("../../shared/event/EventFactory.js");
const GameConfig = require("../../shared/match/GameConfig.js");
const MoveStationCard = require("../../shared/match/MoveStationCard.js");
const ActionLog = require("../../shared/match/log/ActionLog.js");
const Miller = require("../../shared/match/mill/Miller.js");
const PlayerDrawPhase = require("../../shared/match/PlayerDrawPhase.js");
const mapFromClientToServerState = require("./mapFromClientToServerState.js");
const localGameDataFacade = require("../utils/localGameDataFacade.js");
const whatIsNextPhase = require("../../shared/match/whatIsNextPhase.js");
const MatchMode = require("../../shared/match/MatchMode.js");
const CardDataAssembler = require("../../shared/CardDataAssembler.js");
const PlayerCommanders = require("../../shared/match/commander/PlayerCommanders.js");
const Commander = require("../../shared/match/commander/Commander.js");
const Clock = require("../../shared/gameTimer/Clock.js");
const PlayerCardInPlay = require("./card/PlayerCardInPlay.js");
const LastStand = require("../../shared/match/LastStand.js");
const ClientStateChanger = require("../state/ClientStateChanger.js");
const CountCardsLeftToDrawForDrawPhase = require("../../shared/match/rules/CountCardsLeftToDrawForDrawPhase.js");
const CardsThatCanLookAtHandSizeStationRow = require("../../shared/match/card/query/CardsThatCanLookAtHandSizeStationRow.js");
const MoreCardsCanBeDrawnForDrawPhase = require("../../shared/match/rules/MoreCardsCanBeDrawnForDrawPhase.js");
const LookAtStationRow = require("../../shared/match/card/actions/LookAtStationRow.js");
const PlayerActionPointsCalculator = require("../../shared/match/PlayerActionPointsCalculator.js");
const QueryBoard = require("../../shared/match/QueryBoard.js");
const QueryAttacks = require("../../shared/match/requirement/QueryAttacks.js");
const ClientPlayerDeck = require("../card/ClientPlayerDeck.js");
const Luck = require("../../shared/card/Luck");
const { COMMON_PHASE_ORDER, PHASES } = require("./phases.js");

const FlashCardTime = 2000;
const ClientLimitNotice = { note: "not_allowed_on_client" };

module.exports = function (deps) {
  const route = deps.route;
  const rootStore = deps.rootStore;
  const userRepository = deps.userRepository;
  const opponentUser = deps.opponentUser;
  const matchId = deps.matchId;
  const cardInfoRepository = deps.cardInfoRepository;
  const actionPointsCalculator =
    deps.actionPointsCalculator ||
    ActionPointsCalculator({ cardInfoRepository });
  const matchController = deps.matchController;
  const rawCardDataRepository = deps.rawCardDataRepository;

  let gameHasBegun = false;
  let endLastStandIntervalId = null;
  let endGameTimeOut = null;
  persistOngoingMatch();

  return {
    namespaced: true,
    name: "match",
    state: {
      timeNow: Date.now(),
      mode: MatchMode.firstMode,
      readyPlayerIds: [],
      lastStandInfo: null,
      gameConfigEntity: null,
      commanders: [],
      actionLogEntries: [],
      opponentActionLogEntries: [],
      turn: 1,
      currentPlayer: null,
      phase: "",
      events: [],
      requirements: [],
      matchId,
      opponentUser,
      ownUser: userRepository.getOwnUser(),
      playerOrder: [],
      playerCardsInZone: [],
      playerCardsOnHand: [],
      playerDiscardedCards: [],
      playerStation: {
        drawCards: [],
        actionCards: [],
        handSizeCards: [],
      },
      currentDeck: "",
      playerCardsInOpponentZone: [],
      playerCardsInDeckCount: 0,
      opponentCommanders: [],
      opponentPhase: "",
      opponentCardCount: 0,
      botCardsOnHand: [],
      opponentDiscardedCards: [],
      opponentStation: {
        drawCards: [],
        actionCards: [],
        handSizeCards: [],
      },
      opponentCardsInPlayerZone: [],
      opponentCardsInZone: [],
      opponentCardsInDeckCount: 0,
      opponentEvents: [],
      opponentRequirements: [],
      attackerCardId: null,
      selectedDefendingStationCards: [],
      repairerCardId: null,
      repairerCommander: null,
      ended: false,
      retreatedPlayerId: null,
      shake: false,
      highlightCardIds: [],
      flashAttackedCardId: null,
      flashDiscardPile: false,
      flashOpponentDiscardPile: false,
      onLastChangeToWin: false,
      timeRanOutVSBot: false,
      usingCollision: null,
      drawPileRatio: null,
      deckSize: null,
      opponentDeckSize: null,
    },
    getters: {
      isFirstPlayer,
      gameOn,
      botCardsOnHandDebug,
      choosingStartingPlayer,
      getTotalCardsOnHand,
      selectingStartingStationCards,
      isOwnTurn,
      nextPhase,
      getCardsPendingForAction,
      nextPhaseWithAction,
      numberOfPhasesUntilNextPhaseWithAction,
      canSkipAttackPhaseWithPlayerCardsInPlay,
      cardsToDrawInDrawPhase,
      actionPointsFromStationCards,
      maxHandSize,
      amountOfCardsToDiscard,
      startingStationCardsToPutDownCount,
      hasPutDownNonFreeCardThisTurn,
      actionPoints2,
      attackerCard,
      repairerCard,
      attackerCanAttackStationCards,
      attackerDamageGoThroughShields,
      allPlayerCardsInOwnAndOpponentZone,
      allPlayerStationCards,
      playerUnflippedStationCardCount,
      opponentUnflippedStationCardCount,
      allPlayerDurationCards,
      allOpponentStationCards,
      createCard,
      findPlayerCard,
      findPlayerCardFromAllSources,
      cardFactory,
      playerServiceProvider,
      miller,
      playerDrawPhase,
      playerCommanders,
      opponentCommanders,
      moveStationCard,
      lastStand,
      playerPerfectPlan,
      playerFindAcidProjectile,
      playerFindDronesForZuuls,
      playerNaaloxDormantEffect,
      playerRuleService,
      opponentRuleService,
      calculateMoreCardsCanBeDrawnForDrawPhase,
      calculateCountCardsLeftToDrawForDrawPhase,
      lookAtStationRow,
      cardsThatCanLookAtHandSizeStationRow,
      getCanThePlayer,
      canThePlayer,
      canTheOpponent,
      queryBoard,
      turnControl,
      playerPhase,
      opponentPhase,
      queryPlayerRequirements,
      queryOpponentRequirements,
      playerRequirementService,
      opponentRequirementService,
      playerClock,
      opponentClock,
      playerDeck,
      playerStateService,
      opponentStateService,
      playerEventRepository,
      queryEvents,
      queryOpponentEvents,
      actionLog,
      opponentActionLog,
      playerActionPointsCalculator,
      eventFactory,
      matchService,
      opponentRetreated,
      playerRetreated,
      overworkEnabled,
      actionPointsForDrawExtraCardEnabled,
      maxStationCardCount,
      opponentMaxStationCardCount,
      gameConfig,
      cardDataAssembler,
      cardCostInflation,
      repairerCommanderSelected,
      playerHasCardThatCanCounter,
      queryAttacks,
      opponentTopDiscardCard,
      playerTopDiscardCard,
    },
    actions: {
      init,
      // remote
      askToDrawCard,
      passDrawPhase,
      askToDiscardOpponentTopTwoCards,
      overwork,
      actionPointsForDrawExtraCard,
      perfectPlan,
      findAcidProjectile,
      findDronesForZuuls,
      naaloxReviveDrone,
      checkLastTimeOfInactivityForPlayer,
      toggleControlOfTurn,
      skipDrawCard,

      // local & remote
      discardCard,
      goToNextPhase,
      setActionPoints,
      moveCard,
      retreat,
      selectStationCardAsDefender,
      discardDurationCard,
      endGame,
      endLastStand,

      // local TODO many of these have since the start become only remote calls (barely changing any local state)
      stateChanged,

      placeCardInZone,
      placeCardInDiscardPile,
      opponentDiscardedDurationCard,
      opponentMovedCard,
      drawCards,
      selectAsAttacker,
      selectAsAttackerWithCollision,
      selectAsDefender,
      opponentAttackedCard,
      registerAttack,
      removePlayerCard,
      cancelAttack,
      endAttack,
      selectAsRepairer,
      selectNaaloxAsRepairCommander,
      cancelRepair,
      selectForRepair,
      damageStationCards, //todo rename to "damageStationCardsForRequirement",
      damageShieldCards,
      sacrificeCardForRequirement,
      onActionLogChange,
      onOpponentActionLogChange,
      triggerCardAttackedEffect,
      highlightCards,
      triggerFlashDiscardPileEffect,
      triggerFlashOpponentDiscardPileEffect,
      shakeTheScreen,
      matchIsDead,
      onLastChangeToWin,
      timeRanOutVSBot,
    },
    mutations: {
      updateUsingCollision(state, payload) {
        state.usingCollision = payload;
      },
    },
  };

  function init({ state, getters }) {
    setInterval(() => {
      state.timeNow = Date.now();
    }, 250);
  }

  function opponentTopDiscardCard(state) {
    return state.opponentDiscardedCards[
      state.opponentDiscardedCards.length - 1
    ];
  }

  function playerTopDiscardCard(state) {
    return state.playerDiscardedCards[state.playerDiscardedCards.length - 1];
  }

  function isFirstPlayer(state) {
    return state.playerOrder[0] === state.ownUser.id;
  }

  function gameOn(state) {
    return state.mode === MatchMode.game;
  }

  function choosingStartingPlayer(state, getters) {
    return state.mode === MatchMode.chooseStartingPlayer && getters.isOwnTurn;
  }

  function selectingStartingStationCards(state) {
    return state.mode === MatchMode.selectStationCards;
  }

  function isOwnTurn(state) {
    return state.ownUser.id === state.currentPlayer;
  }

  function nextPhase(state, getters) {
    const nextPhase = whatIsNextPhase({
      hasDurationCardInPlay: getters.playerStateService.hasDurationCardInPlay(),
      currentPhase: state.phase,
    });
    return nextPhase || "wait";
  }

  function getTotalCardsOnHand(state) {
    return state.playerCardsOnHand;
  }

  function cardCostInflation(state, getters) {
    return (
      getters.playerStateService
        .getMatchingBehaviourCardsInBoard(
          (card) => card.allCardsCostIncrementEffect
        )
        .filter((card) => getters.canThePlayer.useThisCard(card))
        .map((c) => c.allCardsCostIncrementEffect) || 0
    );
  }

  function nextPhaseWithAction(state, getters) {
    let nextPhase = getters.nextPhase;
    if (nextPhase === PHASES.discard && getters.amountOfCardsToDiscard === 0) {
      nextPhase = whatIsNextPhase({
        hasDurationCardInPlay: getters.playerStateService.hasDurationCardInPlay(),
        currentPhase: PHASES.discard,
      });
    }

    if (nextPhase === PHASES.attack) {
      if (getters.canSkipAttackPhaseWithPlayerCardsInPlay) {
        nextPhase = whatIsNextPhase({
          hasDurationCardInPlay: getters.playerStateService.hasDurationCardInPlay(),
          currentPhase: PHASES.attack,
        });
      }
    }

    return nextPhase || PHASES.wait;
  }

  function numberOfPhasesUntilNextPhaseWithAction(state, getters) {
    const currentNextPhase = getters.nextPhase;
    const nextPhaseWithAction = getters.nextPhaseWithAction;
    return Math.max(
      0,
      getNumberOfPhasesBetween(currentNextPhase, nextPhaseWithAction)
    );
  }

  function canSkipAttackPhaseWithPlayerCardsInPlay(state, getters) {
    const playerCardsInPlay = [
      ...state.playerCardsInZone,
      ...state.playerCardsInOpponentZone,
    ]
      .map((cardData) =>
        getters.createCard(cardData, {
          alternativeConditions: { phase: "attack" },
        })
      )
      .map((card) => {
        return PlayerCardInPlay({
          card,
          attackerSelected: false,
          canThePlayer: getters.canThePlayer,
          opponentStateService: getters.opponentStateService,
        });
      });

    for (const card of playerCardsInPlay) {
      if (
        card.canMove() ||
        card.canAttack() ||
        card.canBeSacrificed() ||
        card.canRepair() ||
        card.canTriggerDormantEffect("attack")
      )
        return false;
    }

    return true;
  }

  function cardsToDrawInDrawPhase(state) {
    return state.playerStation.drawCards.length;
  }

  function actionPointsFromStationCards(state) {
    return state.playerStation.actionCards.length * 2;
  }

  function maxHandSize(state, getters) {
    return getters.playerRuleService.getMaximumHandSize();
  }

  function amountOfCardsToDiscard(state, getters) {
    return Math.max(0, state.playerCardsOnHand.length - getters.maxHandSize);
  }

  function startingStationCardsToPutDownCount(state, getters) {
    const totalAllowedCount = getters.playerStateService.allowedStartingStationCardCount();
    return totalAllowedCount - getters.allPlayerStationCards.length;
  }

  function hasPutDownNonFreeCardThisTurn(state) {
    return state.events.some(
      (e) =>
        e.turn === state.turn &&
        e.type === "putDownCard" &&
        e.location === "zone" &&
        cardInfoRepository.getCost(e.cardCommonId) > 0
    );
  }

  function actionPoints2(state) {
    //TODO Rename "actionPoints"
    return actionPointsCalculator.calculate({
      phase: state.phase,
      turn: state.turn,
      events: state.events,
      actionStationCardsCount: state.playerStation.actionCards.length,
    });
  }

  function playerHasCardThatCanCounter(state, getters) {
    return (
      getters.queryBoard.playerHasCardThatCanCounter() ||
      getters.queryBoard.playerHasCardThatCanCounterAttack()
    );
  }

  function createCard(state, getters) {
    return (
      cardData,
      { isOpponent = false, playerId = null, alternativeConditions } = {}
    ) => {
      const id =
        playerId || (isOpponent ? state.opponentUser.id : state.ownUser.id);
      return getters.cardFactory.createCardForPlayer(
        cardData,
        id,
        alternativeConditions
      );
    };
  }

  function findPlayerCard(state) {
    // TODO Rename => findPlayerCardInZones
    return (cardId) => {
      return (
        state.playerCardsInZone.find((c) => c.id === cardId) ||
        state.playerCardsInOpponentZone.find((c) => c.id === cardId) ||
        null
      );
    };
  }

  function findPlayerCardFromAllSources(state, getters) {
    return (cardId) => {
      const cardInSomeZone =
        state.playerCardsInZone.find((c) => c.id === cardId) ||
        state.playerCardsInOpponentZone.find((c) => c.id === cardId) ||
        state.playerCardsOnHand.find((c) => c.id === cardId);
      if (cardInSomeZone) return cardInSomeZone;

      const stationCard = getters.allPlayerStationCards.find(
        (s) => s.id === cardId
      );
      if (stationCard) return stationCard.card;

      return null;
    };
  }

  function cardFactory(state, getters) {
    return new CardFactory({
      matchService: getters.matchService,
      playerServiceProvider: getters.playerServiceProvider,
      playerServiceFactory: {
        addRequirementFromSpec: () => ClientLimitNotice,
        turnControl: () => getters.turnControl,
        playerPhase: () => getters.playerPhase,
        queryBoard: () => getters.queryBoard,
      },
    });
  }

  function playerServiceProvider(...getterArgs) {
    return ClientPlayerServiceProvider(...getterArgs);
  }

  function playerCommanders(state, getters) {
    return PlayerCommanders({
      playerStateService: getters.playerStateService,
    });
  }

  function playerDrawPhase(state, getters) {
    return PlayerDrawPhase({
      miller: getters.miller,
      moreCardsCanBeDrawnForDrawPhase:
        getters.calculateMoreCardsCanBeDrawnForDrawPhase,
      playerDeck: getters.playerDeck,
      playerPhase: getters.playerPhase,
    });
  }

  function miller(state, getters) {
    return Miller({
      queryPlayerRequirements: getters.queryPlayerRequirements,
      playerCommanders: getters.playerCommanders,
      playerRuleService: getters.playerRuleService,
      opponentStateService: getters.opponentStateService,
    });
  }

  function opponentCommanders(state, getters) {
    return PlayerCommanders({
      playerStateService: getters.opponentStateService,
    });
  }

  function moveStationCard(state, getters) {
    return MoveStationCard({
      matchService: getters.matchService,
      playerStateService: getters.playerStateService,
      playerPhase: getters.playerPhase,
      opponentActionLog: getters.opponentActionLog,
      playerCommanders: getters.playerCommanders,
    });
  }

  function lastStand(state, getters) {
    return LastStand({
      matchService: getters.matchService,
    });
  }

  function playerPerfectPlan(state, getters) {
    return PlayerPerfectPlan({
      playerPhase: getters.playerPhase,
      playerStateService: getters.playerStateService,
      queryPlayerRequirements: getters.queryPlayerRequirements,
      playerRequirementService: getters.playerRequirementService,
      opponentRequirementService: getters.opponentRequirementService,
      playerCommanders: getters.playerCommanders,
      opponentActionLog: ClientLimitNotice,
      addRequirementFromSpec: ClientLimitNotice,
    });
  }

  function playerFindAcidProjectile(state, getters) {
    return new FindAcidProjectile({
      playerPhase: getters.playerPhase,
      playerStateService: getters.playerStateService,
      playerActionPointsCalculator: getters.playerActionPointsCalculator,
      matchService: getters.matchService,
      opponentActionLog: ClientLimitNotice,
      addRequirementFromSpec: ClientLimitNotice,
      playerRequirementFactory: ClientLimitNotice,
      playerRequirementService: ClientLimitNotice,
    });
  }

  function playerFindDronesForZuuls(state, getters) {
    return new FindDronesForZuuls({
      matchService: getters.matchService,
      playerStateService: getters.playerStateService,
      playerPhase: getters.playerPhase,
      opponentActionLog: ClientLimitNotice,
      playerActionLog: ClientLimitNotice,
    });
  }

  function playerNaaloxDormantEffect(state, getters) {
    return new NaaloxDormantEffect({
      matchService: getters.matchService,
      playerStateService: getters.playerStateService,
      playerPhase: getters.playerPhase,
      playerActionPointsCalculator: getters.playerActionPointsCalculator,
      opponentActionLog: ClientLimitNotice,
      playerRequirementFactory: ClientLimitNotice,
      playerActionLog: ClientLimitNotice,
    });
  }

  function playerRuleService(state, getters) {
    return new PlayerRuleService({
      matchService: getters.matchService,
      playerStateService: getters.playerStateService,
      opponentStateService: getters.opponentStateService,
      queryPlayerRequirements: getters.queryPlayerRequirements,
      playerRequirementService: getters.playerRequirementService,
      canThePlayer: getters.canThePlayer,
      canTheOpponent: getters.canTheOpponent,
      turnControl: getters.turnControl,
      playerPhase: getters.playerPhase,
      gameConfig: getters.gameConfig,
      playerCommanders: getters.playerCommanders,
      queryEvents: getters.queryEvents,
      moreCardsCanBeDrawnForDrawPhase:
        getters.calculateMoreCardsCanBeDrawnForDrawPhase,
      countCardsLeftToDrawForDrawPhase:
        getters.calculateCountCardsLeftToDrawForDrawPhase,
    });
  }

  function opponentRuleService(state, getters) {
    return new PlayerRuleService({
      playerStateService: getters.opponentStateService,
      playerCommanders: getters.opponentCommanders,
      gameConfig: getters.gameConfig,
      opponentStateService: ClientLimitNotice,
      playerRequirementService: ClientLimitNotice,
      canThePlayer: ClientLimitNotice,
      turnControl: ClientLimitNotice,
      playerPhase: ClientLimitNotice,
      moreCardsCanBeDrawnForDrawPhase:
        getters.calculateMoreCardsCanBeDrawnForDrawPhase,
      countCardsLeftToDrawForDrawPhase:
        getters.calculateCountCardsLeftToDrawForDrawPhase,
    });
  }

  function calculateMoreCardsCanBeDrawnForDrawPhase(state, getters) {
    return MoreCardsCanBeDrawnForDrawPhase({
      playerPhase: getters.playerPhase,
      countCardsLeftToDrawForDrawPhase:
        getters.calculateCountCardsLeftToDrawForDrawPhase,
    });
  }

  function calculateCountCardsLeftToDrawForDrawPhase(state, getters) {
    return CountCardsLeftToDrawForDrawPhase({
      matchService: getters.matchService,
      queryEvents: getters.queryEvents,
      playerStateService: getters.playerStateService,
    });
  }

  function lookAtStationRow(state, getters) {
    return LookAtStationRow({
      cardsThatCanLookAtHandSizeStationRow:
        getters.cardsThatCanLookAtHandSizeStationRow,
      cardCanLookAtHandSizeStationRow: ClientLimitNotice,
      addRequirementFromSpec: ClientLimitNotice,
      canAddRequirementFromSpec: ClientLimitNotice,
    });
  }

  function cardsThatCanLookAtHandSizeStationRow(state, getters) {
    return CardsThatCanLookAtHandSizeStationRow({
      playerStateService: getters.playerStateService,
    });
  }

  function getCanThePlayer(state, getters) {
    return (playerId) =>
      playerId === state.ownUser.id
        ? getters.canThePlayer
        : getters.canTheOpponent;
  }

  function canThePlayer(state, getters) {
    return new CanThePlayer({
      matchService: getters.matchService,
      queryEvents: getters.queryEvents,
      playerStateService: getters.playerStateService,
      opponentStateService: getters.opponentStateService,
      turnControl: getters.turnControl,
      gameConfig: getters.gameConfig,
      playerPhase: getters.playerPhase,
      playerCommanders: getters.playerCommanders,
      lastStand: getters.lastStand,
      playerActionPointsCalculator: getters.playerActionPointsCalculator,
    });
  }

  function canTheOpponent(state, getters) {
    return new CanThePlayer({
      matchService: getters.matchService,
      queryEvents: getters.queryEvents,
      playerStateService: getters.opponentStateService,
      opponentStateService: getters.playerStateService,
    });
  }

  function queryBoard(state, getters) {
    return new QueryBoard({
      opponentStateService: getters.opponentStateService,
      playerStateService: getters.playerStateService,
      canThePlayer: getters.canThePlayer,
      queryAttacks: getters.queryAttacks,
    });
  }

  function turnControl(state, getters) {
    return new TurnControl({
      matchService: getters.matchService,
      lastStand: getters.lastStand,
      playerStateService: getters.playerStateService,
      playerPhase: getters.playerPhase,
      opponentStateService: getters.opponentStateService,
      opponentPhase: getters.opponentPhase,
      opponentActionLog: ClientLimitNotice,
      playerActionLog: ClientLimitNotice,
    });
  }

  function playerPhase(state, getters) {
    return new PlayerPhase({
      matchService: getters.matchService,
      playerStateService: getters.playerStateService,
    });
  }

  function opponentPhase(state, getters) {
    return new PlayerPhase({
      matchService: getters.matchService,
      playerStateService: getters.opponentStateService,
    });
  }

  function queryPlayerRequirements(state, getters) {
    return QueryPlayerRequirements({
      playerStateService: getters.playerStateService,
      opponentStateService: getters.opponentStateService,
      playerCommanders: ClientLimitNotice,
      moreCardsCanBeDrawnForDrawPhase: ClientLimitNotice,
    });
  }

  function queryOpponentRequirements(state, getters) {
    return QueryPlayerRequirements({
      playerStateService: getters.opponentStateService,
      opponentStateService: getters.playerStateService,
      playerCommanders: ClientLimitNotice,
      moreCardsCanBeDrawnForDrawPhase: ClientLimitNotice,
    });
  }

  function playerRequirementService(state, getters) {
    return PlayerRequirementService({
      playerStateService: getters.playerStateService,
      opponentStateService: getters.opponentStateService,
      queryPlayerRequirements: getters.queryPlayerRequirements,
      playerCommanders: ClientLimitNotice,
      moreCardsCanBeDrawnForDrawPhase: ClientLimitNotice,
    });
  }

  function opponentRequirementService(state, getters) {
    return PlayerRequirementService({
      playerStateService: getters.opponentStateService,
      opponentStateService: getters.playerStateService,
      queryPlayerRequirements: getters.queryOpponentRequirements,
      playerCommanders: ClientLimitNotice,
      moreCardsCanBeDrawnForDrawPhase: ClientLimitNotice,
    });
  }

  function playerClock(state, getters) {
    return Clock({
      playerStateService: getters.playerStateService,
    });
  }

  function opponentClock(state, getters) {
    return Clock({
      playerStateService: getters.opponentStateService,
    });
  }

  function playerDeck(state) {
    return ClientPlayerDeck(state.playerCardsInDeckCount);
  }

  function playerStateService(state, getters) {
    const updateStore = (clientState) => {
      let changedProperties = Object.keys(clientState);
      for (const property of changedProperties) {
        state[property] = clientState[property];
      }
    };
    return new ClientPlayerStateService({
      updateStore,
      playerId: state.ownUser.id,
      matchService: getters.matchService,
      actionPointsCalculator,
      queryEvents: getters.queryEvents,
      cardFactory: () => getters.cardFactory,
      gameConfig: getters.gameConfig,
      deckIsEmpty: () => {
        return state.playerCardsInDeckCount <= 0;
      },
      deckFactory: {
        create: (cards) => ClientPlayerDeck(cards.length),
      },
    });
  }

  function opponentStateService(state, getters) {
    return new ClientPlayerStateService({
      updateStore: () => {
        console.error(
          "Trying to update state through opponent state service, this is NOT intended behaviour."
        );
      },
      playerId: state.opponentUser.id,
      matchService: getters.matchService,
      queryEvents: getters.queryOpponentEvents,
      cardFactory: () => getters.cardFactory,
      gameConfig: getters.gameConfig,
      deckIsEmpty: () => {
        return state.opponentCardsInDeckCount <= 0;
      },
    });
  }

  function playerEventRepository(state, getters) {
    return {
      getAll: () => state.events,
    };
  }

  function queryEvents(state, getters) {
    const eventRepository = {
      getAll: () => state.events,
    };
    const opponentEventRepository = {
      getAll: () => state.opponentEvents,
    };
    return new QueryEvents({
      eventRepository,
      opponentEventRepository,
      matchService: getters.matchService,
      getCurrentTime: () => state.timeNow,
    });
  }

  function queryAttacks(state, getters) {
    const eventRepository = {
      getAll: () => state.events,
    };
    const opponentEventRepository = {
      getAll: () => state.opponentEvents,
    };
    return QueryAttacks({
      gameConfig: getters.gameConfig,
      playerTurnControl: getters.turnControl,
      playerEventRepository: eventRepository,
      opponentEventRepository: opponentEventRepository,
      opponentStateService: getters.opponentStateService,
      getCurrentTime: () => state.timeNow,
    });
  }

  function queryOpponentEvents(state, getters) {
    return new QueryEvents({
      eventRepository: {
        getAll: () => state.opponentEvents,
      },
      opponentEventRepository: {
        getAll: () => state.events,
      },
      matchService: getters.matchService,
      getCurrentTime: () => state.timeNow,
    });
  }

  function actionLog(state, getters) {
    return ActionLog({
      playerStateService: getters.playerStateService,
      cardInfoRepository,
    });
  }

  function opponentActionLog(state, getters) {
    return ActionLog({
      playerStateService: getters.opponentStateService,
      cardInfoRepository,
    });
  }

  function playerActionPointsCalculator(state, getters) {
    return PlayerActionPointsCalculator({
      actionPointsCalculator,
      playerPhase: getters.playerPhase,
      eventRepository: getters.playerEventRepository,
      playerStateService: getters.playerStateService,
      matchService: getters.matchService,
    });
  }

  function eventFactory(state, getters) {
    return EventFactory({
      matchService: getters.matchService,
    });
  }

  function matchService(state, getters) {
    const matchService = new MatchService({
      gameConfig: getters.gameConfig,
      endMatch: () => {},
    });
    const serverState = mapFromClientToServerState(state);
    matchService.setState(serverState);
    return matchService;
  }

  function playerRetreated(state) {
    return state.ended && state.retreatedPlayerId === state.ownUser.id;
  }

  function opponentRetreated(state) {
    return state.ended && state.retreatedPlayerId !== state.ownUser.id;
  }

  function overworkEnabled(state, getters) {
    return getters.playerCommanders.has(Commander.GeneralJackson);
  }

  function actionPointsForDrawExtraCardEnabled(state, getters) {
    return getters.playerCommanders.has(Commander.LianaHenders);
  }

  function maxStationCardCount(state, getters) {
    return getters.playerRuleService.maxStationCardCount();
  }

  function opponentMaxStationCardCount(state, getters) {
    return getters.opponentRuleService.maxStationCardCount();
  }

  function gameConfig(state) {
    if (!state.gameConfigEntity) {
      return GameConfig.notLoaded();
    }

    return GameConfig(state.gameConfigEntity);
  }

  function cardDataAssembler() {
    return CardDataAssembler({ rawCardDataRepository });
  }

  function attackerCard(state, getters) {
    if (!state.attackerCardId) return null;

    const attackerCard = getters.allPlayerCardsInOwnAndOpponentZone.find(
      (c) => c.id === state.attackerCardId
    );
    console.log(getters.createCard(attackerCard));
    return getters.createCard(attackerCard);
  }

  function repairerCard(state, getters) {
    if (!state.repairerCardId) return null;

    const repairerCard = getters.allPlayerCardsInOwnAndOpponentZone.find(
      (c) => c.id === state.repairerCardId
    );
    return getters.createCard(repairerCard);
  }

  function attackerCanAttackStationCards(state, getters) {
    return (
      !!getters.attackerCard && getters.attackerCard.canAttackStationCards()
    );
  }

  function attackerDamageGoThroughShields(state, getters) {
    return (
      !!getters.attackerCard &&
      getters.attackerCard.canDamageGoThroughShieldsDefense()
    );
  }

  function allPlayerCardsInOwnAndOpponentZone(state) {
    return [...state.playerCardsInZone, ...state.playerCardsInOpponentZone];
  }

  function allPlayerStationCards(state) {
    return [
      ...state.playerStation.drawCards,
      ...state.playerStation.actionCards,
      ...state.playerStation.handSizeCards,
    ];
  }

  function allPlayerDurationCards(state) {
    return state.playerCardsInZone.filter((c) => c.type === "duration");
  }

  function allOpponentStationCards(state) {
    return [
      ...state.opponentStation.drawCards,
      ...state.opponentStation.actionCards,
      ...state.opponentStation.handSizeCards,
    ];
  }

  function playerUnflippedStationCardCount(state, getters) {
    return getters.allPlayerStationCards.filter((s) => !s.flipped).length;
  }

  function opponentUnflippedStationCardCount(state, getters) {
    return getters.allOpponentStationCards.filter((s) => !s.flipped).length;
  }

  function askToDrawCard() {
    matchController.emit("drawCard");
  }

  function passDrawPhase() {
    matchController.emit("passDrawPhase");
  }

  function askToDiscardOpponentTopTwoCards() {
    matchController.emit("discardOpponentTopTwoCards");
  }

  function overwork() {
    matchController.emit("overwork");
  }

  function actionPointsForDrawExtraCard() {
    matchController.emit("actionPointsForDrawExtraCard");
  }

  function perfectPlan() {
    matchController.emit("perfectPlan");
  }

  function findAcidProjectile() {
    matchController.emit("findAcidProjectile");
  }

  function findDronesForZuuls() {
    matchController.emit("findDronesForZuuls");
  }

  function selectNaaloxAsRepairCommander({ state }) {
    state.repairerCommander = Commander.Naalox;
  }

  function repairerCommanderSelected(state) {
    return state.repairerCommander;
  }

  function naaloxReviveDrone() {
    matchController.emit("naaloxReviveDrone");
  }

  function toggleControlOfTurn() {
    matchController.emit("toggleControlOfTurn");
  }

  function skipDrawCard() {
    matchController.emit("skipDrawCard");
  }

  function botCardsOnHandDebug(state) {
    return state.botCardsOnHand;
  }

  function stateChanged({ state, getters, dispatch }, data) {
    const clientStateChanger = ClientStateChanger({
      state,
      preMergeHook,
      postMergeHook,
    });
    clientStateChanger.stateChanged(data);

    if (!gameHasBegun) {
      gameHasBegun = true;
    }
    if (
      getters.gameOn &&
      getters.opponentClock.getTime() <= 0 &&
      !isOpponentBot()
    ) {
      setTimeout(() => window.location.reload(), 3 * 60 * 1000);
    }

    if (
      getters.gameOn &&
      getters.playerClock.getTime() <= 0 &&
      (!state.onLastChangeToWin || !state.timeRanOutVSBot)
    ) {
      if (isOpponentBot()) {
        dispatch("timeRanOutVSBot", true);
      } else {
        setTimeout(() => window.location.reload(), 3 * 60 * 1000);
        dispatch("onLastChangeToWin", true);
      }
    }

    function preMergeHook(key, datum) {
      if (gameHasBegun) {
        if (key === "actionLogEntries") {
          if (datum.length !== state.actionLogEntries.length) {
            setTimeout(() => {
              dispatch("onActionLogChange");
            });
          }
        } else if (key === "opponentActionLogEntries") {
          if (datum.length !== state.opponentActionLogEntries.length) {
            setTimeout(() => {
              dispatch("onOpponentActionLogChange");
            });
          }
        } else if (key === "currentPlayer" && datum !== state.currentPlayer) {
          dispatch("card/cancelCurrentUserInteraction", null, { root: true }); //TODO Fix circular dependency on CardStore
        } else if (key === "lastStandInfo") {
          if (datum) {
            endLastStandIntervalId = setInterval(() => {
              dispatch("endLastStand");
            }, 5000);
          }
        }
      }
    }

    function postMergeHook() {
      if (
        (!state.requirements || state.requirements.length === 0) &&
        getters.getCardsPendingForAction.length === 0 &&
        state.phase === PHASES.attack
      ) {
        dispatch("goToNextPhase");
        return;
      }
      if (
        state.requirements &&
        state.requirements.length > 0 &&
        state.requirements[0].type === "moveCardToStationZone"
      ) {
        dispatch(
          "card/_applyChoicePutDownAsExtraStationCard",
          {
            cardData: state.requirements[0].cardData,
            choiceData: {
              name: "putDownAsExtraStationCard",
              text: "Move as extra station card",
              action: {
                name: "putDownCard",
                text: "Move as extra station card",
                showOnlyGhostsFor: ["playerStation"],
              },
            },
          },
          { root: true }
        );
        dispatch(
          "card/removeTransientCard",
          state.requirements[0].cardData.id,
          { root: true }
        );
      }
      // console.log(state.requirements[0]);
      // if (
      //     (!state.requirements || state.requirements.length === 0) &&
      //     getters.getCardsPendingForAction.length === 0 &&
      //     state.phase === PHASES.attack
      // ) {
      //   dispatch("goToNextPhase");
      // }
    }
  }

  //TODO: should call this when there is attack phase and have no cards with actions
  function goToNextPhase({ state, getters }, { currentPhase = null } = {}) {
    const phasesUntilAction = getters.numberOfPhasesUntilNextPhaseWithAction;
    state.phase = currentPhase ? currentPhase : state.phase;
    for (let i = 0; i < phasesUntilAction; i++) {
      matchController.emit("nextPhase", { currentPhase: state.phase });
      state.phase = getters.nextPhase;
    }
    matchController.emit("nextPhase", { currentPhase: state.phase });

    const nextPhaseWithAction = getters.nextPhaseWithAction;
    state.phase = nextPhaseWithAction;
    if (nextPhaseWithAction === PHASES.wait) {
      state.currentPlayer = null;
    }

    if (nextPhaseWithAction === PHASES.action) {
      if (getters.playerFindDronesForZuuls.canIssueFindDronesForZuuls()) {
        matchController.emit("findDronesForZuuls");
      }
    }
  }

  function getCardsPendingForAction(state, getters) {
    const cardsInZone = [...state.playerCardsInZone]
      .map((cardData) => getters.createCard(cardData))
      .map((card) => buildCardInPlay(card, getters))
      .filter((cardInPlay) => {
        return (
          cardInPlay.canMove() ||
          cardInPlay.canAttack() ||
          cardInPlay.canBeSacrificed() ||
          cardInPlay.canRepair() ||
          cardInPlay.canTriggerDormantEffect()
        );
      });

    const cardsInOpponentZone = [...state.playerCardsInOpponentZone]
      .map((cardData) => getters.createCard(cardData))
      .map((card) => buildCardInPlay(card, getters))
      .filter((cardInPlay) => {
        return (
          cardInPlay.canAttack() ||
          cardInPlay.canBeSacrificed() ||
          cardInPlay.canRepair() ||
          cardInPlay.canTriggerDormantEffect()
        );
      });

    return [...cardsInZone, ...cardsInOpponentZone];
  }

  function buildCardInPlay(card, { canThePlayer, opponentStateService }) {
    return PlayerCardInPlay({
      card,
      attackerSelected: false,
      canThePlayer: canThePlayer,
      opponentStateService: opponentStateService,
    });
  }

  function placeCardInZone({ state }, card) {
    state.playerCardsInZone.push(card);
  }

  function placeCardInDiscardPile({ state }, card) {
    state.playerDiscardedCards.push(card);
  }

  function discardCard({ state, getters, dispatch }, cardId) {
    const cardIndexOnHand = state.playerCardsOnHand.findIndex(
      (c) => c.id === cardId
    );
    const discardedCard = state.playerCardsOnHand[cardIndexOnHand];
    state.playerCardsOnHand.splice(cardIndexOnHand, 1);
    dispatch("match/placeCardInDiscardPile", discardedCard, { root: true });

    state.events.push(
      DiscardCardEvent({
        turn: state.turn,
        phase: state.phase,
        cardId: cardId,
        cardCommonId: discardedCard.commonId,
      })
    );
    matchController.emit("discardCard", cardId);

    if (
      state.phase === PHASES.discard &&
      getters.amountOfCardsToDiscard === 0
    ) {
      dispatch("goToNextPhase");
    }
  }

  function setActionPoints({ state }, actionPoints) {
    // TODO Should be removed, all action points should be calculated through events
  }

  function moveCard({ getters }, { id }) {
    getters.playerStateService.moveCard(id);
    matchController.emit("moveCard", id);
  }

  function opponentDiscardedDurationCard({ state }, { card }) {
    state.opponentDiscardedCards.push(card);
    const cardIndexInZone = state.opponentCardsInZone.findIndex(
      (c) => c.id === card.id
    );
    state.opponentCardsInZone.splice(cardIndexInZone, 1);
  }

  function opponentMovedCard({ state }, cardId) {
    const cardIndex = state.opponentCardsInZone.findIndex(
      (c) => c.id === cardId
    );
    const [card] = state.opponentCardsInZone.splice(cardIndex, 1);
    state.opponentCardsInPlayerZone.push(card);
  }

  //TODO Should NOT take "cards" as a parameter. This should be emitted and received by a StateChanged event
  function drawCards(
    { state, dispatch },
    { cards = [], moreCardsCanBeDrawn, currentPhase }
  ) {
    state.playerCardsOnHand.push(...cards);
    if (!moreCardsCanBeDrawn) {
      dispatch("goToNextPhase", { currentPhase });
    }
  }

  function selectAsAttacker({ state }, card) {
    state.attackerCardId = card.id;
  }

  function selectAsAttackerWithCollision({ state, getters, commit }, card) {
    state.attackerCardId = card.id;
    const attackerCard = getters.attackerCard;
    attackerCard._card.usingCollision = true;
    commit("updateUsingCollision", true);
  }

  function selectAsDefender(
    { state, dispatch },
    { card, fromRequirement = null }
  ) {
    let attackerCardId = state.attackerCardId;
    let usingCollision = state.usingCollision;
    const defenderCardId = card.id;
    if (fromRequirement === "damageShieldCard") {
      attackerCardId = rootStore.getters["requirement/firstRequirement"].cardId;
      dispatch("damageShieldCards", [defenderCardId]);
    }
    if (fromRequirement === "damageSpaceship") {
      matchController.emit("damageSpaceship", {
        cardId: defenderCardId,
      });
      return;
    }
    matchController.emit("attack", {
      attackerCardId,
      defenderCardId,
      usingCollision,
    });

    dispatch("registerAttack", { attackerCardId, defenderCardId });
    dispatch("triggerCardAttackedEffect", defenderCardId);
  }

  function opponentAttackedCard(
    { state, getters },
    {
      attackerCardId,
      defenderCardId,
      newDamage,
      attackerCardWasDestroyed,
      defenderCardWasDestroyed,
    }
  ) {
    const defenderCardInPlayerZone = state.playerCardsInZone.find(
      (c) => c.id === defenderCardId
    );
    const defenderCardInOpponentZone = state.playerCardsInOpponentZone.find(
      (c) => c.id === defenderCardId
    );
    const defenderCard = defenderCardInPlayerZone || defenderCardInOpponentZone;
    const defenderCardZone = defenderCardInPlayerZone
      ? state.playerCardsInZone
      : state.playerCardsInOpponentZone;
    if (defenderCardWasDestroyed) {
      const defenderCardIndex = defenderCardZone.findIndex(
        (c) => c.id === defenderCardId
      );
      defenderCardZone.splice(defenderCardIndex, 1);
    } else {
      defenderCard.damage = newDamage;
    }

    if (attackerCardWasDestroyed) {
      const attackerCardInPlayerZone = state.opponentCardsInZone.find(
        (c) => c.id === attackerCardId
      );
      const attackerCardZone = attackerCardInPlayerZone
        ? state.opponentCardsInZone
        : state.opponentCardsInPlayerZone;
      const attackerCardIndex = attackerCardZone.findIndex(
        (c) => c.id === attackerCardId
      );
      attackerCardZone.splice(attackerCardIndex, 1);
    }
  }

  function cancelAttack({ dispatch }) {
    dispatch("endAttack");
  }

  function endAttack({ state }) {
    state.attackerCardId = null;
    state.usingCollision = null;
    state.selectedDefendingStationCards = [];
  }

  function selectAsRepairer({ state }, repairerCardId) {
    state.repairerCardId = repairerCardId;
  }

  function cancelRepair({ state }) {
    state.repairerCardId = null;
  }

  function selectForRepair({ state, getters }, cardToRepairId) {
    const repairerCardId = state.repairerCardId;
    const repairerCommander = state.repairerCommander;
    state.repairerCardId = null;
    state.repairerCommander = null;
    if (repairerCommander) {
      matchController.emit("naaloxRepairStationCard", { cardToRepairId });
    } else {
      matchController.emit("repairCard", { repairerCardId, cardToRepairId });
    }
  }

  function damageStationCards({}, targetIds) {
    matchController.emit("damageStationCards", { targetIds });
  }

  function damageShieldCards({}, targetIds) {
    matchController.emit("damageShieldCards", { targetIds });
  }

  function sacrificeCardForRequirement({}, targetIds) {
    matchController.emit("sacrificeCardForRequirement", { targetIds });
  }

  function retreat() {
    matchController.emit("retreat");
  }

  function checkLastTimeOfInactivityForPlayer() {
    matchController.emit("checkLastTimeOfInactivityForPlayer");
  }

  function selectStationCardAsDefender({ state, getters, dispatch }, { id }) {
    const attackerCard = getters.attackerCard;
    attackerCard._card.usingCollision = state.usingCollision;
    const targetStationCardIds = state.selectedDefendingStationCards;
    targetStationCardIds.push(id);

    const selectedLastStationCard =
      getters.opponentUnflippedStationCardCount === targetStationCardIds.length;

    const totalOpponentShieldCards = getters.opponentStateService.getMatchingBehaviourCards(
      (c) => c.stopsStationAttack()
    );
    const totalShieldDamage = totalOpponentShieldCards.reduce(
      (acc, card) => acc + card.defense - card.damage,
      0
    );
    const selectedMaxTargetCount =
      targetStationCardIds.length >= attackerCard.attack - totalShieldDamage;

    const attackerCardId = state.attackerCardId;

    if (selectedMaxTargetCount || selectedLastStationCard) {
      matchController.emit("attackStationCard", {
        attackerCardId,
        targetStationCardIds,
        usingCollision: state.usingCollision,
      });
      dispatch("registerAttack", { attackerCardId, targetStationCardIds });
      dispatch("shakeTheScreen");
    }
  }

  function registerAttack(
    { state, getters, dispatch },
    { attackerCardId, defenderCardId = null, targetStationCardIds = null }
  ) {
    const cardData = getters.allPlayerCardsInOwnAndOpponentZone.find(
      (c) => c.id === attackerCardId
    );
    if (cardData.type === "missile") {
      dispatch("removePlayerCard", attackerCardId);
    }
    state.events.push(
      AttackEvent({
        turn: state.turn,
        attackerCardId,
        defenderCardId,
        targetStationCardIds,
        cardCommonId: cardData.commonId,
      })
    );

    dispatch("endAttack");
  }

  function removePlayerCard({ state }, cardId) {
    const cardInZoneIndex = state.playerCardsInZone.findIndex(
      (c) => c.id === cardId
    );
    if (cardInZoneIndex >= 0) {
      state.playerCardsInZone.splice(cardInZoneIndex, 1);
    } else {
      const cardInOpponentZoneIndex = state.playerCardsInOpponentZone.findIndex(
        (c) => c.id === cardId
      );
      if (cardInOpponentZoneIndex >= 0) {
        state.playerCardsInOpponentZone.splice(cardInOpponentZoneIndex, 1);
      }
    }
  }

  function discardDurationCard({ state, getters, dispatch }, cardData) {
    matchController.emit("discardDurationCard", cardData.id);
    state.playerDiscardedCards.push(cardData);
    const cardIndexInZone = state.playerCardsInZone.findIndex(
      (c) => c.id === cardData.id
    );
    state.playerCardsInZone.splice(cardIndexInZone, 1);

    state.events.push(
      DiscardCardEvent({
        turn: state.turn,
        phase: state.phase,
        cardId: cardData.id,
        cardCommonId: cardData.commonId,
      })
    );

    if (getters.allPlayerDurationCards.length === 0) {
      dispatch("goToNextPhase");
    }
  }

  function endGame() {
    clearInterval(endLastStandIntervalId);
    deleteMatchLocalDataAndReturnToStart();
  }

  function deleteMatchLocalDataAndReturnToStart() {
    if (!endGameTimeOut) {
      endGameTimeOut = setTimeout(
        () => _closeGameViewAndGoToLobby(),
        15 * 1000
      );
    } else {
      clearTimeout(endGameTimeOut);
      _closeGameViewAndGoToLobby();
    }
  }

  function _closeGameViewAndGoToLobby() {
    matchController.emit("playerEndedMatch");
    localGameDataFacade.removeOngoingMatch();
    route("start");
  }

  function getNumberOfPhasesBetween(a, b) {
    const phasesIncludingWaitInOrder = [...COMMON_PHASE_ORDER, PHASES.wait];
    return (
      phasesIncludingWaitInOrder.indexOf(b) -
      phasesIncludingWaitInOrder.indexOf(a)
    );
  }

  function onActionLogChange({ state, dispatch }) {
    const actionLogEntries = state.actionLogEntries;
    const latestEntry = actionLogEntries[actionLogEntries.length - 1];

    const action = latestEntry.action;
    if (action === "played") {
      dispatch("highlightCards", latestEntry.cardIds);
    } else if (action === "damagedInAttack") {
      dispatch("triggerCardAttackedEffect", latestEntry.defenderCardId);
    } else if (action === "paralyzed") {
      dispatch("highlightCards", [latestEntry.defenderCardId]);
    } else if (action === "destroyed") {
      dispatch("triggerFlashDiscardPileEffect");
    } else if (action === "discarded") {
      dispatch("triggerFlashDiscardPileEffect");
    } else if (action === "stationCardsDamaged") {
      dispatch("shakeTheScreen");
    } else if (action === "countered") {
      dispatch("notificationBanner/showForActionLogEntry", latestEntry, {
        root: true,
      });
      dispatch("triggerFlashDiscardPileEffect");
    } else if (action === "repairedCard") {
      dispatch("highlightCards", [latestEntry.repairedCardId]);
    } else if (action === "counteredAttackOnCard") {
      dispatch("notificationBanner/showForActionLogEntry", latestEntry, {
        root: true,
      });
      dispatch("highlightCards", [latestEntry.defenderCardId]);
    }
  }

  function onOpponentActionLogChange({ state, dispatch }) {
    const actionLogEntries = state.opponentActionLogEntries;
    const latestEntry = actionLogEntries[actionLogEntries.length - 1];

    const action = latestEntry.action;
    if (action === "destroyed") {
      dispatch("triggerFlashOpponentDiscardPileEffect");
    } else if (action === "repairedCard") {
      dispatch("highlightCards", [latestEntry.repairedCardId]);
    } else if (action === "countered") {
      dispatch("triggerFlashOpponentDiscardPileEffect");
    } else if (action === "counteredAttackOnCard") {
      dispatch("highlightCards", [latestEntry.defenderCardId]);
    }
  }

  function triggerFlashDiscardPileEffect({ state }) {
    setTimeout(() => {
      state.flashDiscardPile = true;
    });
    setTimeout(() => {
      state.flashDiscardPile = false;
    }, FlashCardTime);
  }

  function triggerFlashOpponentDiscardPileEffect({ state }) {
    setTimeout(() => {
      state.flashOpponentDiscardPile = true;
    });
    setTimeout(() => {
      state.flashOpponentDiscardPile = false;
    }, FlashCardTime);
  }

  function triggerCardAttackedEffect({ state }, cardId) {
    setTimeout(() => {
      state.flashAttackedCardId = cardId;
    });
    setTimeout(() => {
      state.flashAttackedCardId = null;
    }, FlashCardTime);
  }

  function highlightCards({ state }, cardIds) {
    setTimeout(() => {
      state.highlightCardIds = cardIds;
    });
    setTimeout(() => {
      state.highlightCardIds = [];
    }, FlashCardTime);
  }

  function shakeTheScreen({ state }) {
    setTimeout(() => {
      state.shake = true;
    });
    setTimeout(() => {
      state.shake = false;
    }, 300);
  }

  function matchIsDead({ dispatch }) {
    dispatch("inactivity/stop", null, { root: true });
    endGame();
  }

  function endLastStand() {
    matchController.emit("endLastStand");
  }

  function persistOngoingMatch() {
    const playerIds = [userRepository.getOwnUser().id, opponentUser.id];
    const matchData = {
      id: matchId,
      playerIds,
      ownId: userRepository.getOwnUser().id,
      timeStamp: new Date(),
    };
    localGameDataFacade.setOngoingMatch(matchData);
  }

  function onLastChangeToWin({ state }, value) {
    state.onLastChangeToWin = value;
  }

  function timeRanOutVSBot({ state }, value) {
    state.timeRanOutVSBot = value;
  }

  function isOpponentBot() {
    return opponentUser.id === "BOT";
  }
};

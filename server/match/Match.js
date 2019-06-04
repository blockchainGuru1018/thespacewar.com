const ActionPointsCalculator = require('../../shared/match/ActionPointsCalculator.js');
const FindCardController = require('./controller/FindCardController.js');
const DrawCardController = require('./controller/DrawCardController.js');
const AttackController = require('./controller/AttackController.js');
const DebugController = require('./DebugController.js');
const MoveCardController = require('./controller/MoveCardController.js');
const PutDownCardController = require('./controller/PutDownCardController.js');
const DiscardCardController = require('./controller/DiscardCardController.js');
const NextPhaseController = require('./controller/NextPhaseController.js');
const StartGameController = require('./controller/StartGameController.js');
const OverworkController = require('./controller/OverworkController.js');
const TriggerDormantEffect = require('./command/TriggerDormantEffect.js');
const CheatController = require('./controller/CheatController.js');
const MatchComService = require('./service/MatchComService.js');
const PlayerRequirementUpdaterFactory = require('./PlayerRequirementUpdaterFactory.js');
const StateChangeListener = require('../../shared/match/StateChangeListener.js');
const PlayerServiceProvider = require('../../shared/match/PlayerServiceProvider.js');
const PlayerOverworkFactory = require('../../shared/match/overwork/PlayerOverworkFactory.js');
const PlayerServiceFactory = require('../../shared/match/PlayerServiceFactory.js');
const GameServiceFactory = require('../../shared/match/GameServiceFactory.js');
const MatchMode = require('../../shared/match/MatchMode.js');
const { PHASES } = require('../../shared/phases.js');

const ServiceTypes = PlayerServiceProvider.TYPE;

module.exports = function ({
    players,
    matchId,
    deckFactory,
    cardInfoRepository,
    logger,
    rawCardDataRepository,
    endMatch,
    gameConfig,
    actionPointsCalculator = ActionPointsCalculator({ cardInfoRepository })
}) {

    const playerIds = players.map(p => p.id);
    const firstPlayerId = randomItem(playerIds);
    const playerOrder = [
        firstPlayerId,
        playerIds.find(id => id !== firstPlayerId)
    ];

    const state = {
        mode: MatchMode.firstMode,
        gameStartTime: Date.now(),
        turn: 1,
        currentPlayer: firstPlayerId,
        playerOrder,
        playersReady: 0,
        ended: false,
        retreatedPlayerId: null,
        playerStateById: {},
        deckByPlayerId: {
            [players[0].id]: deckFactory.create(),
            [players[1].id]: deckFactory.create(),
        }
    };

    const gameServiceFactory = GameServiceFactory({
        state,
        endMatch,
        rawCardDataRepository,
        gameConfig
    });
    const playerServiceFactory = PlayerServiceFactory({
        state,
        endMatch,
        actionPointsCalculator,
        logger,
        gameConfig,
        gameServiceFactory,
        userRepository: {
            getById: id => players.find(p => p.id === id)
        }
    });
    const matchService = playerServiceFactory.matchService();
    const playerServiceProvider = playerServiceFactory.playerServiceProvider();
    const stateChangeListener = new StateChangeListener({ playerServiceProvider, matchService, logger });
    const matchComService = new MatchComService({
        matchId,
        players,
        logger,
        matchService,
        playerServiceProvider,
        stateChangeListener
    });

    const playerRequirementUpdaterFactory = new PlayerRequirementUpdaterFactory({
        playerServiceProvider,
        matchComService,
        playerServiceFactory
    });
    const playerOverworkFactory = PlayerOverworkFactory({ playerServiceFactory });

    const stateSerializer = gameServiceFactory.stateSerializer();
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
        playerServiceFactory,
        stateMemento: gameServiceFactory.stateMemento(),
        gameConfig
    };

    const debugController = DebugController(controllerDeps);
    const cheatController = CheatController(controllerDeps);
    const drawCardController = DrawCardController(controllerDeps);
    const findCardController = FindCardController(controllerDeps);
    const attackController = AttackController(controllerDeps);
    const moveCardController = MoveCardController(controllerDeps);
    const putDownCardController = PutDownCardController(controllerDeps);
    const discardCardController = DiscardCardController(controllerDeps);
    const nextPhaseController = NextPhaseController(controllerDeps);
    const startGameController = StartGameController(controllerDeps);
    const overworkController = OverworkController(controllerDeps);

    const unwrappedApi = {
        id: matchId,
        matchId, //TODO Remove all uses
        get players() {
            return matchComService.getPlayers();
        },
        start: startGameController.start,
        refresh,
        getOwnState: getPlayerState,
        restoreFromState,
        toClientModel,
        hasEnded,
        saveMatch: debugController.onSaveMatch,
        updatePlayer: matchComService.updatePlayer.bind(matchComService)
    };
    const api = {
        selectPlayerToStart: startGameController.selectPlayerToStart,
        nextPhase: nextPhaseController.onNextPhase,
        toggleControlOfTurn: nextPhaseController.onToggleControlOfTurn,
        putDownCard: putDownCardController.onPutDownCard,
        selectStartingStationCard: startGameController.selectStartingStationCard,
        counterCard: putDownCardController.counterCard,
        cancelCounterCard: putDownCardController.cancelCounterCard,
        drawCard: drawCardController.onDrawCard,
        discardOpponentTopTwoCards: drawCardController.onDiscardOpponentTopTwoCards,
        discardCard: discardCardController.onDiscardCard, //TODO Rename discardFromHand
        discardDurationCard,
        moveCard: moveCardController.onMoveCard,
        moveStationCard: moveCardController.moveStationCard,
        attack: attackController.onAttack,
        counterAttack: attackController.counterAttack,
        cancelCounterAttack: attackController.cancelCounterAttack,
        attackStationCard: attackController.onAttackStationCards, // TODO Rename attackStationCards (pluralized),
        sacrifice: attackController.onSacrifice,
        damageStationCards: attackController.onDamageStationCard,
        selectCardForFindCardRequirement: findCardController.onSelectCard,
        overwork: overworkController.overwork,
        triggerDormantEffect: PlayerCommand(TriggerDormantEffect, controllerDeps),
        repairCard,
        retreat,
        restoreSavedMatch: debugController.onRestoreSavedMatch,
        cheat: cheatController.onCheat
    };
    return {
        ...unwrappedApi,
        ...wrapApi({ api, matchComService, stateChangeListener })
    };

    function refresh(playerId) {
        startGameController.repairPotentiallyInconsistentState(playerId);
        matchComService.emitCurrentStateToPlayers();
    }

    function discardDurationCard(playerId, cardId) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);

        if (playerStateService.getPhase() !== PHASES.preparation) {
            throw CheatError('Cannot discard duration cards after turn your has started');
        }
        playerStateService.removeAndDiscardCardFromStationOrZone(cardId);
    }

    function repairCard(playerId, { repairerCardId, cardToRepairId }) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const cardFactory = playerServiceFactory.cardFactory();

        const repairerCardData = playerStateService.findCard(repairerCardId);
        const repairerCard = cardFactory.createCardForPlayer(repairerCardData, playerId);
        if (!repairerCard.canRepair()) throw CheatError('Cannot repair');

        playerStateService.repairCard(repairerCardId, cardToRepairId);
    }

    function retreat(playerId) {
        state.ended = true;
        state.retreatedPlayerId = playerId;
        matchComService.emitCurrentStateToPlayers();
    }

    function getPlayerState(playerId) {
        return state.playerStateById[playerId];
    }

    function restoreFromState(restoreState) {
        for (let key of Object.keys(restoreState)) {
            state[key] = restoreState[key];
            matchService.setState(state);
        }

        state.playersReady = 2;
    }

    function toClientModel() {
        const players = matchComService.getPlayers();
        return {
            playerIds: players.map(p => p.id),
            id: matchId
        }
    }

    function hasEnded() {
        return state.ended;
    }
};

function wrapApi({ api, matchComService, stateChangeListener }) {
    const wrappedApi = {};
    for (let name of Object.keys(api)) {
        if (typeof api[name] === 'function') {
            wrappedApi[name] = (...args) => {

                //WARNING: For some reason "callEnded" was not always setting its flag to false before the next call runs ".snapshot".
                // So this was added and it fixed the bug. But it would be nice to know _why_ in the future!
                matchComService.callStarted();
                //END OF WARNING

                let result;
                try {
                    result = api[name](...args);
                    stateChangeListener.snapshot();
                }
                finally {
                    //WARNING: See related warning about ".callStarted". If it no longer exists, delete this warning.
                    matchComService.callEnded();
                    //END OF WARNING
                }

                return result;
            };
        }
        else {
            wrappedApi[name] = api[name];
        }
    }
    return wrappedApi;
}

function CheatError(reason) {
    const error = new Error(reason);
    error.message = reason;
    error.type = 'CheatDetected';
    return error;
}

function PlayerCommand(Command, deps) {
    return (playerId, ...args) => {
        const playerServiceProvider = deps.playerServiceProvider;
        const command = Command({
            playerStateService: playerServiceProvider.byTypeAndId(ServiceTypes.state, playerId),
            canThePlayer: playerServiceProvider.byTypeAndId(ServiceTypes.canThePlayer, playerId)
        });
        return command(...args);
    };
}

function randomItem(collection) {
    return collection[Math.round(Math.random() * (collection.length - 1))];
}

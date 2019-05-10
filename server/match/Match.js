const ActionPointsCalculator = require('../../shared/match/ActionPointsCalculator.js');
const FindCardController = require('./controller/FindCardController.js');
const DrawCardController = require('./controller/DrawCardController.js');
const AttackController = require('./controller/AttackController.js');
const DebugController = require('./DebugController.js');
const MoveCardController = require('./controller/MoveCardController.js');
const PutDownCardController = require('./controller/PutDownCardController.js');
const DiscardCardController = require('./controller/DiscardCardController.js');
const NextPhaseController = require('./controller/NextPhaseController.js');
const OverworkController = require('./controller/OverworkController.js');
const TriggerDormantEffect = require('./command/TriggerDormantEffect.js');
const CheatController = require('./controller/CheatController.js');
const MatchComService = require('./service/MatchComService.js');
const MatchService = require('../../shared/match/MatchService.js');
const ServerQueryEvents = require('./ServerQueryEvents.js');
const PlayerStateService = require('../../shared/match/PlayerStateService.js');
const PlayerRequirementService = require('../../shared/match/requirement/PlayerRequirementService.js');
const PlayerRequirementUpdaterFactory = require('./PlayerRequirementUpdaterFactory.js');
const ServerCardFactory = require('../card/ServerCardFactory.js');
const StateChangeListener = require('../../shared/match/StateChangeListener.js');
const CanThePlayer = require('../../shared/match/CanThePlayer.js');
const TurnControl = require('../../shared/match/TurnControl.js');
const PlayerPhase = require('../../shared/match/PlayerPhase.js');
const PlayerRuleService = require('../../shared/match/PlayerRuleService.js');
const obscureOpponentEvents = require('./service/obscureOpponentEvents.js');
const PlayerServiceProvider = require('../../shared/match/PlayerServiceProvider.js');
const RequirementFactory = require('../../shared/match/requirement/RequirementFactory.js');
const PlayerOverworkFactory = require('../../shared/match/overwork/PlayerOverworkFactory.js');
const EventFactory = require('../../shared/event/EventFactory.js');
const CardDataAssembler = require('../../shared/CardDataAssembler.js');
const StateSerializer = require('./StateSerializer.js');
const { PHASES, TEMPORARY_START_PHASE } = require('../../shared/phases.js');

const ServiceTypes = PlayerServiceProvider.TYPE;

module.exports = function ({
    logger,
    deckFactory,
    cardInfoRepository,
    matchId,
    players,
    actionPointsCalculator = ActionPointsCalculator({ cardInfoRepository }),
    endMatch,
    rawCardDataRepository
}) {

    const playerOrder = players.map(p => p.id);

    const state = {
        gameStartTime: Date.now(),
        turn: 1,
        currentPlayer: players[0].id,
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

    const playerServiceProvider = PlayerServiceProvider();
    const matchService = new MatchService({ matchId, endMatch });
    const requirementFactory = RequirementFactory({ playerServiceProvider, matchService });
    const cardFactory = new ServerCardFactory({ playerServiceProvider, getFreshState: () => state });
    matchService.setState(state);

    const eventFactory = EventFactory({ matchService });
    const canThePlayerFactory = CanThePlayerFactory({ matchService, playerServiceProvider });

    registerPlayerStateServices({
        players,
        matchService,
        actionPointsCalculator,
        logger,
        cardFactory,
        playerServiceProvider,
        eventFactory
    });
    registerMiscPlayerServices({
        players,
        matchService,
        playerServiceProvider
    });
    registerPlayerRequirementServices({ players, requirementFactory, playerServiceProvider });
    registerCanThePlayerServices({ players, playerServiceProvider, canThePlayerFactory });
    registerPlayerRuleServices({ players, playerServiceProvider });

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
        matchComService
    });
    const playerOverworkFactory = PlayerOverworkFactory({ matchService, playerServiceProvider });

    const cardDataAssembler = CardDataAssembler({ rawCardDataRepository });
    const stateSerializer = StateSerializer({ cardDataAssembler, restoreFromState });
    const controllerDeps = {
        logger,
        matchService,
        matchComService,
        restoreFromState,
        playerServiceProvider,
        cardFactory,
        stateChangeListener,
        playerRequirementUpdaterFactory,
        rawCardDataRepository,
        playerOverworkFactory,
        stateSerializer
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
    const overworkController = OverworkController(controllerDeps);

    const unwrappedApi = {
        id: matchId,
        matchId, //TODO Remove all uses
        get players() {
            return matchComService.getPlayers();
        },
        start,
        refresh,
        getOwnState: getPlayerState,
        restoreFromState,
        toClientModel,
        hasEnded,
        saveMatch: debugController.onSaveMatch,
        updatePlayer: matchComService.updatePlayer.bind(matchComService)
    };
    const api = {
        nextPhase: nextPhaseController.onNextPhase,
        toggleControlOfTurn: nextPhaseController.onToggleControlOfTurn,
        putDownCard: putDownCardController.onPutDownCard,
        counterCard: putDownCardController.counterCard,
        cancelCounterCard: putDownCardController.cancelCounterCard,
        drawCard: drawCardController.onDrawCard,
        discardOpponentTopTwoCards: drawCardController.onDiscardOpponentTopTwoCards,
        discardCard: discardCardController.onDiscardCard, //TODO Rename discardFromHand
        discardDurationCard,
        moveCard: moveCardController.onMoveCard,
        attack: attackController.onAttack,
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

    function start() {
        const players = matchComService.getPlayers();
        const gameHasAlreadyStarted = state.playersReady >= players.length;
        if (gameHasAlreadyStarted) {
            players.forEach(player => repairPotentiallyInconsistentState(player.id));
            matchComService.emitCurrentStateToPlayers();
        }
        else {
            state.playersReady++;
            if (state.playersReady === players.length) {
                players.forEach((player, index) => startGameForPlayer(player.id, { isFirstPlayer: index === 0 }));
                players.forEach(player => emitBeginGameForPlayer(player.id));
            }
        }
    }

    function refresh(playerId) {
        repairPotentiallyInconsistentState(playerId);
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

    function repairPotentiallyInconsistentState(playerId) {
        const opponentId = matchService.getOpponentId(playerId);
        repairRequirements({
            playerRequirementService: playerServiceProvider.getRequirementServiceById(playerId),
            opponentRequirementService: playerServiceProvider.getRequirementServiceById(opponentId)
        });
    }

    function startGameForPlayer(playerId, { isFirstPlayer }) {
        let playerDeck = state.deckByPlayerId[playerId];
        let stationCards = [
            { card: playerDeck.drawSingle(), place: 'draw' },
            { card: playerDeck.drawSingle(), place: 'action' },
            { card: playerDeck.drawSingle(), place: 'action' },
            { card: playerDeck.drawSingle(), place: 'action' },
            { card: playerDeck.drawSingle(), place: 'handSize' }
        ];
        let cardsOnHand = playerDeck.draw(7);
        state.playerStateById[playerId] = {
            cardsOnHand,
            stationCards,
            cardsInZone: [],
            cardsInOpponentZone: [],
            discardedCards: [],
            phase: isFirstPlayer ? TEMPORARY_START_PHASE : 'wait',
            actionPoints: 0,
            events: [],
            requirements: []
        };
    }

    function emitBeginGameForPlayer(playerId) {
        const playerStateService = playerServiceProvider.byTypeAndId(ServiceTypes.state, playerId);
        const stationCards = playerStateService.getStationCards();

        const opponentId = matchService.getOpponentId(playerId);
        const opponentStateService = playerServiceProvider.byTypeAndId(ServiceTypes.state, opponentId);
        const opponentStationCards = opponentStateService.getStationCards();

        emitToPlayer(playerId, 'beginGame', {
            stationCards: prepareStationCardsForClient(stationCards),
            cardsOnHand: playerStateService.getCardsOnHand(),
            phase: playerStateService.getPhase(),
            currentPlayer: state.currentPlayer,
            playerOrder: state.playerOrder,
            opponentPhase: opponentStateService.getPhase(),
            opponentCardCount: getOpponentCardCount(playerId),
            opponentStationCards: prepareStationCardsForClient(opponentStationCards)
        });
    }

    function emitToPlayer(playerId, action, value) {
        const players = matchComService.getPlayers();
        const player = players.find(p => p.id === playerId);
        player.connection.emit('match', { matchId, action, value });
    }

    function getActionPointsForPlayer(playerId) {
        const playerState = getPlayerState(playerId);
        const playerStationCards = getPlayerStationCards(playerId);
        const actionStationCardsCount = playerStationCards.filter(s => s.place === 'action').length;
        return actionPointsCalculator.calculate({
            phase: playerState.phase,
            events: playerState.events,
            turn: state.turn,
            actionStationCardsCount
        });
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

    function getOpponentCardCount(playerId) {
        const opponentId = getOpponentId(playerId);
        return getPlayerCardCount(opponentId);
    }

    function getPlayerCardCount(playerId) {
        const playerState = getPlayerState(playerId);
        return playerState.cardsOnHand.length;
    }

    function getOpponentDiscardedCards(playerId) {
        const opponentId = getOpponentId(playerId);
        return getPlayerDiscardedCards(opponentId);
    }

    function getPlayerDiscardedCards(playerId) {
        const playerState = getPlayerState(playerId);
        return playerState.discardedCards;
    }

    function getOpponentStationCards(playerId) {
        return getPlayerStationCards(getOpponentId(playerId));
    }

    function getPlayerStationCards(playerId) {
        const playerState = getPlayerState(playerId);
        return playerState.stationCards;
    }

    function prepareStationCardsForClient(stationCards) {
        return stationCards.map(prepareStationCardForClient);
    }

    function prepareStationCardForClient(stationCard) {
        let model = {
            id: stationCard.card.id,
            place: stationCard.place
        };
        if (stationCard.flipped) {
            model.flipped = true;
            model.card = stationCard.card;
        }
        return model;
    }

    function getOpponentId(playerId) {
        const players = matchComService.getPlayers();
        return players.find(p => p.id !== playerId).id;
    }

    function getOpponentState(playerId) {
        return getPlayerState(getOpponentId(playerId));
    }
};

function wrapApi({ api, matchComService, stateChangeListener }) {
    const wrappedApi = {};
    for (let name of Object.keys(api)) {
        if (typeof api[name] === 'function') {
            wrappedApi[name] = (...args) => {
                let result;
                try {
                    result = api[name](...args);
                    stateChangeListener.snapshot();
                }
                finally {
                    matchComService.callEnded();
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

function repairRequirements({ playerRequirementService, opponentRequirementService }) {
    let playerWaitingRequirement = playerRequirementService.getFirstMatchingRequirement({ waiting: true });
    let opponentWaitingRequirement = opponentRequirementService.getFirstMatchingRequirement({ waiting: true });
    while (!!playerWaitingRequirement !== !!opponentWaitingRequirement) {
        if (playerWaitingRequirement) {
            playerRequirementService.removeFirstMatchingRequirement({ waiting: true });
        }
        else {
            opponentRequirementService.removeFirstMatchingRequirement({ waiting: true });
        }

        playerWaitingRequirement = playerRequirementService.getFirstMatchingRequirement({ waiting: true });
        opponentWaitingRequirement = opponentRequirementService.getFirstMatchingRequirement({ waiting: true });
    }
}

function registerPlayerStateServices({ players, matchService, actionPointsCalculator, logger, cardFactory, playerServiceProvider, eventFactory }) {
    for (let player of players) {
        const playerId = player.id;
        const playerStateService = new PlayerStateService({
            playerId,
            matchService,
            queryEvents: new ServerQueryEvents({ playerId, matchService }),
            actionPointsCalculator,
            logger,
            cardFactory,
            eventFactory
        });
        playerServiceProvider.registerService(ServiceTypes.state, playerId, playerStateService);
    }
}

function registerMiscPlayerServices({ players, matchService, playerServiceProvider }) {
    for (const player of players) {
        const playerId = player.id;

        const playerPhase = new PlayerPhase({
            matchService,
            playerStateService: playerServiceProvider.getStateServiceById(playerId)
        });
        playerServiceProvider.registerService(ServiceTypes.phase, playerId, playerPhase);
    }

    for (const player of players) {
        const playerId = player.id;
        const opponentId = matchService.getOpponentId(playerId);

        const turnControl = new TurnControl({
            matchService,
            opponentStateService: playerServiceProvider.byTypeAndId(ServiceTypes.state, opponentId),
            playerStateService: playerServiceProvider.getStateServiceById(playerId),
            playerPhase: playerServiceProvider.byTypeAndId(ServiceTypes.phase, playerId),
            opponentPhase: playerServiceProvider.byTypeAndId(ServiceTypes.phase, opponentId)
        });
        playerServiceProvider.registerService(ServiceTypes.turnControl, player.id, turnControl);
    }
}

function registerPlayerRequirementServices({ players, requirementFactory, playerServiceProvider }) {
    for (let player of players) {
        const playerId = player.id;
        const opponentId = players.find(p => p.id !== playerId).id;
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        const opponentStateService = playerServiceProvider.getStateServiceById(opponentId);
        const playerRequirementService = new PlayerRequirementService({
            playerStateService,
            opponentStateService,
            requirementFactory
        });
        playerServiceProvider.registerService(ServiceTypes.requirement, playerId, playerRequirementService);
    }
}

function registerCanThePlayerServices({ players, playerServiceProvider, canThePlayerFactory }) {
    for (let player of players) {
        const playerId = player.id;
        let canThePlayer = canThePlayerFactory.forPlayer(playerId);
        playerServiceProvider.registerService(ServiceTypes.canThePlayer, playerId, canThePlayer);
    }
}

function registerPlayerRuleServices({ players, playerServiceProvider }) {
    for (let player of players) {
        const playerId = player.id;
        const opponentId = players.find(p => p.id !== playerId).id;
        let ruleService = new PlayerRuleService({
            playerStateService: playerServiceProvider.getStateServiceById(playerId),
            playerRequirementService: playerServiceProvider.byTypeAndId(ServiceTypes.requirement, playerId),
            opponentStateService: playerServiceProvider.getStateServiceById(opponentId),
            canThePlayer: playerServiceProvider.getCanThePlayerServiceById(playerId),
            turnControl: playerServiceProvider.byTypeAndId(ServiceTypes.turnControl, playerId),
            playerPhase: playerServiceProvider.byTypeAndId(ServiceTypes.phase, playerId)
        });

        playerServiceProvider.registerService(ServiceTypes.rule, playerId, ruleService);
    }
}

function CheatError(reason) {
    const error = new Error(reason);
    error.message = reason;
    error.type = 'CheatDetected';
    return error;
}

function CanThePlayerFactory({
    matchService,
    playerServiceProvider
}) {

    return {
        forPlayer(playerId) {
            let opponentId = matchService.getOpponentId(playerId);
            let playerStateService = playerServiceProvider.getStateServiceById(playerId);
            return new CanThePlayer({
                matchService,
                queryEvents: new ServerQueryEvents({ playerId, matchService }),
                playerStateService,
                opponentStateService: playerServiceProvider.getStateServiceById(opponentId),
                turnControl: playerServiceProvider.byTypeAndId(ServiceTypes.turnControl, playerId)
            });
        }
    }
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

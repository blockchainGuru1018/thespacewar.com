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
const PlayerRuleService = require('../../shared/match/PlayerRuleService.js');
const obscureOpponentEvents = require('./service/obscureOpponentEvents.js');
const PlayerServiceProvider = require('../../shared/match/PlayerServiceProvider.js');
const RequirementFactory = require('../../shared/match/requirement/RequirementFactory.js');
const PlayerOverworkFactory = require('../../shared/match/overwork/PlayerOverworkFactory.js');
const EventFactory = require('../../shared/event/EventFactory.js');
const { PHASES, TEMPORARY_START_PHASE } = require('../../shared/phases.js');

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
        turn: 1,
        currentPlayer: players[0].id,
        playerOrder,
        playersReady: 0,
        playerStateById: {},
        deckByPlayerId: {
            [players[0].id]: deckFactory.create(),
            [players[1].id]: deckFactory.create(),
        }
    };

    const playerServiceProvider = PlayerServiceProvider();
    const cardFactory = new ServerCardFactory({ playerServiceProvider, getFreshState: () => state });
    const matchService = new MatchService({ matchId, endMatch });
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
    registerPlayerRequirementServices(players, playerServiceProvider);
    registerCanThePlayerServices({ players, playerServiceProvider, canThePlayerFactory });
    registerPlayerRuleServices(players, playerServiceProvider);

    const stateChangeListener = new StateChangeListener({ playerServiceProvider, matchService, logger });
    const matchComService = new MatchComService({
        matchId,
        players,
        logger,
        playerServiceProvider,
        stateChangeListener
    });

    const playerRequirementUpdaterFactory = new PlayerRequirementUpdaterFactory({
        playerServiceProvider,
        matchComService
    });
    const playerOverworkFactory = PlayerOverworkFactory({ matchService, playerServiceProvider });
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
        playerOverworkFactory
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

    const api = {
        id: matchId,
        matchId, //TODO Remove all uses
        get players() {
            return matchComService.getPlayers();
        },
        start,
        refresh,
        getOwnState: getPlayerState,
        nextPhase: nextPhaseController.onNextPhase,
        putDownCard: putDownCardController.onPutDownCard,
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
        repairCard,
        retreat,
        updatePlayer: matchComService.updatePlayer.bind(matchComService),
        saveMatch: debugController.onSaveMatch,
        restoreSavedMatch: debugController.onRestoreSavedMatch,
        restoreFromState,
        toClientModel,
        hasEnded,
        cheat: cheatController.onCheat
    };
    return wrapApi({ api, stateChangeListener });

    function start() {
        const players = matchComService.getPlayers();
        const gameHasAlreadyStarted = state.playersReady >= players.length;
        if (gameHasAlreadyStarted) {
            for (let player of players) {
                emitRestoreStateForPlayer(player.id);
            }
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
        emitRestoreStateForPlayer(playerId);
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
        const opponentId = getOpponentId(playerId);
        emitToPlayer(opponentId, 'opponentRetreated');

        state.ended = true;
        state.playerRetreated = playerId;
    }

    function getPlayerState(playerId) {
        return state.playerStateById[playerId];
    }

    function restoreFromState(restoreState) {
        for (let key of Object.keys(restoreState)) {
            state[key] = restoreState[key];
        }

        state.playersReady = 2;
    }

    function emitRestoreStateForPlayer(playerId) {
        const opponentId = matchService.getOpponentId(playerId);
        repairRequirements({
            playerRequirementUpdater: playerServiceProvider.getRequirementServiceById(playerId),
            opponentRequirementUpdater: playerServiceProvider.getRequirementServiceById(opponentId)
        });

        const playerState = getPlayerState(playerId);
        const actionPointsForPlayer = getActionPointsForPlayer(playerId)
        const opponentState = getOpponentState(playerId);
        const playerRetreated = !!state.playerRetreated ? state.playerRetreated === playerId : false;
        const opponentRetreated = !!state.playerRetreated ? state.playerRetreated !== playerId : false;
        const opponentStationCards = getOpponentStationCards(playerId);
        emitToPlayer(playerId, 'restoreState', {
            ...playerState,
            stationCards: prepareStationCardsForClient(playerState.stationCards),
            actionPoints: actionPointsForPlayer,
            turn: state.turn,
            currentPlayer: state.currentPlayer,
            playerOrder: state.playerOrder,
            opponentCardsInZone: opponentState.cardsInZone,
            opponentCardsInPlayerZone: opponentState.cardsInOpponentZone,
            opponentCardCount: getOpponentCardCount(playerId),
            opponentDiscardedCards: getOpponentDiscardedCards(playerId),
            opponentStationCards: prepareStationCardsForClient(opponentStationCards),
            opponentEvents: obscureOpponentEvents(opponentState.events),
            opponentRetreated,
            playerRetreated
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
        const {
            stationCards,
            cardsOnHand,
            phase,
        } = getPlayerState(playerId);
        const opponentStationCards = getOpponentStationCards(playerId);
        emitToPlayer(playerId, 'beginGame', {
            stationCards: prepareStationCardsForClient(stationCards),
            cardsOnHand,
            phase,
            currentPlayer: state.currentPlayer,
            playerOrder: state.playerOrder,
            opponentCardCount: getOpponentCardCount(playerId),
            opponentStationCards: prepareStationCardsForClient(opponentStationCards)
        });
    }

    function emitToPlayer(playerId, action, value) {
        const players = matchComService.getPlayers();
        const player = players.find(p => p.id === playerId)
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

function wrapApi({ api, stateChangeListener }) {
    const wrappedApi = {};
    for (let name of Object.keys(api)) {
        if (typeof api[name] === 'function') {
            wrappedApi[name] = (...args) => {
                const result = api[name](...args);
                stateChangeListener.snapshot();
                return result;
            };
        }
        else {
            wrappedApi[name] = api[name];
        }
    }
    return wrappedApi;
}

function repairRequirements({
    playerRequirementUpdater,
    opponentRequirementUpdater
}) {
    let playerWaitingRequirement = playerRequirementUpdater.getFirstMatchingRequirement({ waiting: true });
    let opponentWaitingRequirement = opponentRequirementUpdater.getFirstMatchingRequirement({ waiting: true });
    while (!!playerWaitingRequirement !== !!opponentWaitingRequirement) {
        if (playerWaitingRequirement) {
            playerRequirementUpdater.removeFirstMatchingRequirement({ waiting: true });
        }
        else {
            opponentRequirementUpdater.removeFirstMatchingRequirement({ waiting: true });
        }

        playerWaitingRequirement = playerRequirementUpdater.getFirstMatchingRequirement({ waiting: true });
        opponentWaitingRequirement = opponentRequirementUpdater.getFirstMatchingRequirement({ waiting: true });
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
        playerServiceProvider.registerService(PlayerServiceProvider.TYPE.state, playerId, playerStateService);
    }
}

function registerPlayerRequirementServices(players, playerServiceProvider) {
    const requirementFactory = RequirementFactory({ playerServiceProvider });
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
        playerServiceProvider.registerService(
            PlayerServiceProvider.TYPE.requirement,
            playerId,
            playerRequirementService
        );
    }
}

function registerCanThePlayerServices({ players, playerServiceProvider, canThePlayerFactory }) {
    for (let player of players) {
        const playerId = player.id;
        let canThePlayer = canThePlayerFactory.forPlayer(playerId);
        playerServiceProvider.registerService(PlayerServiceProvider.TYPE.canThePlayer, playerId, canThePlayer);
    }
}

function registerPlayerRuleServices(players, playerServiceProvider) {
    for (let player of players) {
        const playerId = player.id;
        const opponentId = players.find(p => p.id !== playerId).id;
        let ruleService = new PlayerRuleService({
            playerStateService: playerServiceProvider.getStateServiceById(playerId),
            opponentStateService: playerServiceProvider.getStateServiceById(opponentId),
            canThePlayer: playerServiceProvider.getCanThePlayerServiceById(playerId)
        });
        playerServiceProvider.registerService(PlayerServiceProvider.TYPE.rule, playerId, ruleService);
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
            return new CanThePlayer({
                matchService,
                queryEvents: new ServerQueryEvents({ playerId, matchService }),
                playerStateService: playerServiceProvider.getStateServiceById(playerId),
                opponentStateService: playerServiceProvider.getStateServiceById(opponentId),
            });
        }
    }
}
const ActionPointsCalculator = require('../../shared/match/ActionPointsCalculator.js');
const DrawCardController = require('./controller/DrawCardController.js');
const AttackController = require('./controller/AttackController.js');
const DebugController = require('./DebugController.js');
const MoveCardController = require('./controller/MoveCardController.js');
const PutDownCardController = require('./controller/PutDownCardController.js');
const DiscardCardController = require('./controller/DiscardCardController.js');
const NextPhaseController = require('./controller/NextPhaseController.js');
const MatchComService = require('./service/MatchComService.js');
const MatchService = require('../../shared/match/MatchService.js');
const ServerQueryEvents = require('./ServerQueryEvents.js');
const PlayerStateService = require('../../shared/match/PlayerStateService.js');
const PlayerRequirementService = require('../../shared/match/PlayerRequirementService.js');
const PlayerRequirementUpdaterFactory = require('./PlayerRequirementUpdaterFactory.js');
const CardFactory = require('../card/ServerCardFactory.js');
const StateChangeListener = require('../../shared/match/StateChangeListener.js');
const CanThePlayer = require('../../shared/match/CanThePlayer.js');
const { PHASES, TEMPORARY_START_PHASE } = require('../../shared/phases.js');

module.exports = function ({
    logger,
    deckFactory,
    cardInfoRepository,
    matchId,
    players,
    actionPointsCalculator = ActionPointsCalculator({ cardInfoRepository }),
    endMatch
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

    const cardFactory = new CardFactory({ getFreshState: () => state });
    const matchService = new MatchService({ matchId, endMatch });
    matchService.setState(state);

    const playerStateServiceById = {};
    const playerRequirementServiceById = {};
    for (let player of players) {
        const playerStateService = new PlayerStateService({
            playerId: player.id,
            matchService,
            queryEvents: new ServerQueryEvents({ playerId: player.id, matchService }),
            actionPointsCalculator,
            logger,
            cardFactory
        })
        playerStateServiceById[player.id] = playerStateService;
        playerRequirementServiceById[player.id] = new PlayerRequirementService({ playerStateService });
    }
    const playerServiceProvider = {
        getStateServiceById: playerId => playerStateServiceById[playerId],
        getRequirementServiceById: playerId => playerRequirementServiceById[playerId]
    };

    const stateChangeListener = new StateChangeListener({ playerServiceProvider, matchService, logger });
    const matchComService = new MatchComService({
        matchId,
        players,
        logger,
        playerServiceProvider,
        stateChangeListener
    });

    const controllerDeps = {
        matchService,
        matchComService,
        playerStateServiceById,
        restoreFromState,
        playerServiceProvider,
        cardFactory,
        stateChangeListener,
        playerRequirementUpdaterFactory: new PlayerRequirementUpdaterFactory({
            playerServiceProvider,
            matchComService
        }),
        canThePlayerFactory: {
            forPlayer(playerId) {
                let opponentId = matchService.getOpponentId(playerId);
                return new CanThePlayer({
                    playerStateService: playerServiceProvider.getStateServiceById(playerId),
                    opponentStateService: playerServiceProvider.getStateServiceById(opponentId),
                });
            }
        }
    };

    const debugController = DebugController(controllerDeps);
    const drawCardController = DrawCardController(controllerDeps);
    const attackController = AttackController(controllerDeps);
    const moveCardController = MoveCardController(controllerDeps);
    const putDownCardController = PutDownCardController(controllerDeps);
    const discardCardController = DiscardCardController(controllerDeps);
    const nextPhaseController = NextPhaseController(controllerDeps);

    const api = {
        id: matchId,
        matchId, //TODO Remove all uses
        get players() {
            return matchComService.getPlayers();
        },
        start,
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
        damageOwnStationCards: attackController.onDamageOwnStationCard,
        repairCard,
        retreat,
        updatePlayer: matchComService.updatePlayer.bind(matchComService),
        saveMatch: debugController.onSaveMatch,
        restoreSavedMatch: debugController.onRestoreSavedMatch,
        restoreFromState,
        toClientModel,
        hasEnded,
    }
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
                players.forEach(player => startGameForPlayer(player.id));
                players.forEach(player => emitBeginGameForPlayer(player.id));
            }
        }
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
            opponentCardsInZone: opponentState.cardsInZone,
            opponentCardsInPlayerZone: opponentState.cardsInOpponentZone,
            opponentCardCount: getOpponentCardCount(playerId),
            opponentDiscardedCards: getOpponentDiscardedCards(playerId),
            opponentStationCards: prepareStationCardsForClient(opponentStationCards),
            opponentRetreated,
            playerRetreated
        });
    }

    function startGameForPlayer(playerId) {
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
            phase: TEMPORARY_START_PHASE,
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
        const opponentStationCards = getOpponentStationCards(playerId)
        emitToPlayer(playerId, 'beginGame', {
            stationCards: prepareStationCardsForClient(stationCards),
            cardsOnHand,
            phase,
            currentPlayer: state.currentPlayer,
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

function CheatError(reason) {
    const error = new Error(reason);
    error.message = reason;
    error.type = 'CheatDetected';
    return error;
}
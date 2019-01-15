const DiscardCardEvent = require('../../shared/event/DiscardCardEvent.js');
const RepairCardEvent = require('../../shared/event/RepairCardEvent.js');
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

const itemNamesForOpponentByItemNameForPlayer = {
    stationCards: 'opponentStationCards',
    cardsInZone: 'opponentCardsInZone',
    cardsInOpponentZone: 'opponentCardsInPlayerZone',
    discardedCards: 'opponentDiscardedCards'
};

module.exports = function (deps) {

    const deckFactory = deps.deckFactory;
    const cardInfoRepository = deps.cardInfoRepository;
    const matchId = deps.matchId;
    const players = deps.players;
    const actionPointsCalculator = deps.actionPointsCalculator || ActionPointsCalculator({ cardInfoRepository });
    const endMatch = deps.endMatch;

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

    const matchService = new MatchService({ matchId, endMatch });
    matchService.setState(state);

    const playerStateServiceById = {};
    const playerRequirementServiceById = {};
    for (let player of players) {
        const playerStateService = new PlayerStateService({
            playerId: player.id,
            matchService,
            queryEvents: new ServerQueryEvents({ playerId: player.id, matchService }),
            actionPointsCalculator
        })
        playerStateServiceById[player.id] = playerStateService;
        playerRequirementServiceById[player.id] = new PlayerRequirementService({ playerStateService });
    }
    const playerServiceProvider = {
        getStateServiceById: playerId => playerStateServiceById[playerId],
        getRequirementServiceById: playerId => playerRequirementServiceById[playerId]
    };

    const stateChangeListener = new StateChangeListener({ playerServiceProvider, matchService });
    const matchComService = new MatchComService({ matchId, players, stateChangeListener });
    const cardFactory = new CardFactory({ getFreshState: () => state });

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

    return {
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
        hasEnded
    };

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
        const playerState = getPlayerState(playerId);
        if (playerState.phase !== PHASES.preparation) {
            throw CheatError('Cannot discard duration cards after turn your has started');
        }

        const cardData = playerState.cardsInZone.find(c => c.id === cardId);
        removePlayerCard(playerId, cardId);
        playerState.discardedCards.push(cardData);

        const opponentId = getOpponentId(playerId);
        emitToPlayer(opponentId, 'opponentDiscardedDurationCard', { card: cardData });

        playerState.events.push(DiscardCardEvent({
            turn: state.turn,
            phase: playerState.phase,
            cardId,
            cardCommonId: cardData.commonId
        }));
    }

    function findPlayerCard(playerId, cardId) {
        const playerState = getPlayerState(playerId);
        return playerState.cardsInZone.find(c => c.id === cardId)
            || playerState.cardsInOpponentZone.find(c => c.id === cardId)
            || null;
    }

    function removePlayerCard(playerId, cardId) {
        const playerState = getPlayerState(playerId);

        const cardInZoneIndex = playerState.cardsInZone.findIndex(c => c.id === cardId);
        if (cardInZoneIndex >= 0) {
            playerState.cardsInZone.splice(cardInZoneIndex, 1);
        }
        else {
            const cardInOpponentZoneIndex = playerState.cardsInOpponentZone.findIndex(c => c.id === cardId);
            if (cardInOpponentZoneIndex >= 0) {
                playerState.cardsInOpponentZone.splice(cardInOpponentZoneIndex, 1);
            }
        }
    }

    function updatePlayerCard(playerId, cardId, updateFn) {
        const playerState = getPlayerState(playerId);
        let card = playerState.cardsInZone.find(c => c.id === cardId)
            || playerState.cardsInOpponentZone.find(c => c.id === cardId);
        if (!card) throw Error('Could not find card when trying to update it. ID: ' + cardId);
        updateFn(card);
    }

    function repairCard(playerId, { repairerCardId, cardToRepairId }) {
        const repairerCardData = findPlayerCard(playerId, repairerCardId);
        const repairerCard = cardFactory.createCardForPlayer(repairerCardData, playerId);
        if (!repairerCard.canRepair()) throw CheatError('Cannot repair');

        const cardToRepairData = findPlayerCard(playerId, cardToRepairId);
        const cardToRepair = cardFactory.createCardForPlayer(cardToRepairData, playerId);
        repairerCard.repairCard(cardToRepair);
        updatePlayerCard(playerId, cardToRepair.id, card => {
            card.damage = cardToRepair.damage;
        });

        const playerState = getPlayerState(playerId);
        playerState.events.push(RepairCardEvent({
            turn: state.turn,
            cardId: repairerCard.id,
            cardCommonId: repairerCard.commonId,
            repairedCardId: cardToRepair.id,
            repairedCardCommonId: cardToRepair.commonId
        }));
        let zoneName = playerState.cardsInZone.some(c => c.id === cardToRepair.id)
            ? 'cardsInZone'
            : 'cardsInOpponentZone';
        emitToOpponent(playerId, 'stateChanged', {
            [itemNamesForOpponentByItemNameForPlayer[zoneName]]: playerState[zoneName],
            events: playerState.events
        });
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

    function emitToOpponent(playerId, action, value) {
        const players = matchComService.getPlayers();
        const opponent = players.find(p => p.id !== playerId);
        emitToPlayer(opponent.id, action, value);
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

function CheatError(reason) {
    const error = new Error(reason);
    error.message = reason;
    error.type = 'CheatDetected';
    return error;
}
let {
    testCase,
    stub,
    sinon,
    assert,
    refute,
    defaults
} = require('bocha');
let FakeDeck = require('../testUtils/FakeDeck.js');
let FakeDeckFactory = require('../testUtils/FakeDeckFactory.js');
let FakeCardDataAssembler = require('../testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const createDeckFromCards = FakeDeckFactory.createDeckFromCards;
let CardInfoRepository = require('../../../shared/CardInfoRepository.js');
let Match = require('../../match/Match.js');

module.exports = {
    bocha: {
        testCase,
        stub,
        sinon,
        assert,
        refute,
        defaults
    },
    ...{
        FakeDeck,
        FakeDeckFactory,
        FakeCardDataAssembler,
        createCard,
        createDeckFromCards,
        CardInfoRepository,
        Match
    },
    ...{
        createPlayers,
        Player,
        createPlayer,
        createMatchAndGoToFirstActionPhase,
        createMatchAndGoToSecondActionPhase,
        createMatchAndGoToFirstAttackPhase,
        createMatchAndGoToSecondAttackPhase,
        createMatchAndGoToFirstDiscardPhase,
        discardCardsAsPlayer,
        createMatch,
        FakeConnection,
        FakeConnection2,
        catchError,
        repeat,
        createState,
        createPlayerState
    }
};

function createPlayers(playerOptions) {
    return [
        createPlayer(playerOptions[0] || {}),
        createPlayer(playerOptions[1] || {})
    ];
}

function Player(id = '007', connection = FakeConnection2()) {
    return createPlayer({ id, connection });
}

function createPlayer(options = {}) { // TODO Make "Player" be createPlayer and this be something else
    return defaults(options, {
        id: '007',
        name: 'James',
        connection: FakeConnection2()
    });
}

function createMatchAndGoToFirstActionPhase(deps = {}) {
    const match = createMatch(deps);
    match.start();
    match.start();
    match.nextPhase(match.players[0].id);
    match.drawCard(match.players[0].id);
    match.nextPhase(match.players[0].id);
    return match;
}

function createMatchAndGoToFirstDiscardPhase(deps = {}) {
    const match = createMatchAndGoToFirstActionPhase(deps);
    match.nextPhase(match.players[0].id);
    return match;
}

function createMatchAndGoToFirstAttackPhase(deps = {}) {
    const match = createMatch(deps);
    match.start();
    match.start();

    const [firstPlayer, _] = match.players;
    match.nextPhase(firstPlayer.id);
    match.nextPhase(firstPlayer.id);
    match.nextPhase(firstPlayer.id);

    let firstPlayerCards = null;
    firstPlayer.connection.on('restoreState', state => {
        firstPlayerCards = state.cardsOnHand;
    });
    match.start();
    const cardsToDiscard = firstPlayerCards.slice(0, 5).map(card => card.id);
    discardCardsAsPlayer(cardsToDiscard, firstPlayer.id, match);

    match.nextPhase(firstPlayer.id);

    return match;
}

function createMatchAndGoToSecondActionPhase(deps = {}) {
    const match = createMatchAndGoToFirstAttackPhase(deps);
    match.nextPhase(match.players[0].id);

    match.nextPhase(match.players[1].id);
    return match;
}

function createMatchAndGoToSecondAttackPhase(deps = {}) {
    const match = createMatchAndGoToSecondActionPhase(deps);
    match.nextPhase(match.players[1].id);

    const [_, secondPlayer] = match.players;
    let secondPlayerCards = null;
    secondPlayer.connection.on('restoreState', state => {
        secondPlayerCards = state.cardsOnHand;
    });
    match.start();
    const cardsToDiscard = secondPlayerCards.slice(0, 5).map(card => card.id);
    discardCardsAsPlayer(cardsToDiscard, secondPlayer.id, match);

    match.nextPhase(match.players[1].id);

    return match;
}

function discardCardsAsPlayer(cardIds, playerId, match) {
    for (let i = 0; i < cardIds.length; i++) {
        match.discardCard(playerId, cardIds[i]);
    }
}

function createMatch(deps = {}) {
    if (deps.players && deps.players.length === 1) {
        deps.players.push(Player('P2A'));
    }
    const deckFactory = deps.deckFactory || FakeDeckFactory.fromCards([createCard()]);
    const cardDataAssembler = deckFactory._getCardDataAssembler();
    defaults(deps, {
        deckFactory,
        cardInfoRepository: CardInfoRepository({ cardDataAssembler }),
        players: [createPlayer('P1A'), createPlayer('P2A')],
        logger: {
            log: (...args) => console.log(...args)
        }
    });
    return Match(deps);
}

function FakeConnection(listenerByActionName) { // TODO Migrate this to the new and then rename the new one to this name
    return {
        emit(_, { action, value }) {
            if (listenerByActionName[action]) {
                listenerByActionName[action](value);
            }
        }
    };
}

function FakeConnection2(namesOfActionsToStub = []) {
    const stubMap = {};
    for (let name of namesOfActionsToStub) {
        stubMap[name] = stub();
    }
    const listenersByActionName = {};

    return {
        emit(_, { action, value }) {
            if (stubMap[action]) {
                stubMap[action](value);
            }
            if (listenersByActionName[action]) {
                listenersByActionName[action].forEach(listener => listener(value));
            }
        },
        on(action, callback) {
            listenersByActionName[action] = listenersByActionName[action] || [];
            listenersByActionName[action].push(callback);
        },
        ...stubMap
    };
}

function catchError(callback) {
    try {
        callback();
    } catch (error) {
        return error;
    }
}

function repeat(count, callback) {
    for (let i = 0; i < count; i++) {
        callback();
    }
}

function createState(options) {
    defaults(options, {
        turn: 1,
        currentPlayer: 'P1A',
        playerOrder: ['P1A', 'P2A'],
        playerStateById: {},
        deckByPlayerId: {}
    });

    const playerStateIds = Object.keys(options.playerStateById);
    if (playerStateIds.length < 2) {
        playerStateIds.push(options.playerOrder[1]);
    }
    for (let key of playerStateIds) {
        options.playerStateById[key] = createPlayerState(options.playerStateById[key]);
    }

    for (let playerId of options.playerOrder) {
        if (!options.deckByPlayerId[playerId]) {
            options.deckByPlayerId[playerId] = FakeDeckFactory.createDeckFromCards([FakeCardDataAssembler.createCard()]);
        }
        if (!options.playerStateById[playerId]) {
            options.playerStateById[playerId] = createPlayerState();
        }
    }

    return options;
}

function createPlayerState(options = {}) {
    return defaults(options, {
        phase: 'wait',
        cardsOnHand: [],
        cardsInZone: [],
        cardsInOpponentZone: [],
        stationCards: [],
        discardedCards: [],
        events: [],
        requirements: []
    });
}
const {
    defaults
} = require('bocha');
const FakeDeckFactory = require('../../../server/test/testUtils/FakeDeckFactory.js');
const FakeCardDataAssembler = require('../../../server/test/testUtils/FakeCardDataAssembler.js');

module.exports = function createState(options = {}) {
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
};

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

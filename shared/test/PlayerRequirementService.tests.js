let bocha = require('bocha');
let sinon = bocha.sinon;
let assert = bocha.assert;
let refute = bocha.refute;
let defaults = bocha.defaults;
const FakeCardDataAssembler = require("../../server/test/testUtils/FakeCardDataAssembler.js");//TODO Move to shared
const createCard = FakeCardDataAssembler.createCard;
const ServerCardFactory = require('../../server/card/ServerCardFactory.js');
const PlayerStateService = require('../match/PlayerStateService.js');
const MatchService = require('../match/MatchService.js');
const FakeDeckFactory = require('../../server/test/testUtils/FakeDeckFactory.js')
const PlayerServiceProvider = require('../match/PlayerServiceProvider.js');
const PlayerRequirementService = require('../match/PlayerRequirementService.js');
const FakeDeck = require("../../server/test/testUtils/FakeDeck.js")

module.exports = bocha.testCase('PlayerRequirementService', {
    'when player has 0 cards on hand and adds a discard card requirement it should NOT be added': function () {
        const state = createState({
            playerStateById: {
                'P1A': {
                    cardsOnHand: []
                }
            }
        });
        const service = createServiceForPlayer(state, 'P1A');

        service.addDiscardCardRequirement({ count: 1 });

        assert.equals(service.getRequirements(), []);
    },
    'when player has 2 cards on hand and adds 3 discard card requirements of count 1 should only add the first 2': function () {
        const state = createState({
            playerStateById: {
                'P1A': {
                    cardsOnHand: [createCard({ id: 'C1A' }), createCard({ id: 'C2A' })]
                }
            }
        });
        const service = createServiceForPlayer(state, 'P1A');

        service.addCardRequirement({ type: 'discardCard', count: 1 });
        service.addCardRequirement({ type: 'discardCard', count: 1 });
        service.addCardRequirement({ type: 'discardCard', count: 1 });

        assert.equals(service.getRequirements(), [
            { type: 'discardCard', count: 1 },
            { type: 'discardCard', count: 1 }
        ]);
    },
    'when player has 2 cards in deck and adds 3 draw card requirements of count 1 should only add the first 2': function () {
        const state = createState({
            deckByPlayerId: {
                'P1A': FakeDeck.fromCards([createCard({ id: 'C1A' }), createCard({ id: 'C2A' })])
            }
        });
        const service = createServiceForPlayer(state, 'P1A');

        service.addCardRequirement({ type: 'drawCard', count: 1 });
        service.addCardRequirement({ type: 'drawCard', count: 1 });
        service.addCardRequirement({ type: 'drawCard', count: 1 });

        assert.equals(service.getRequirements(), [
            { type: 'drawCard', count: 1 },
            { type: 'drawCard', count: 1 }
        ]);
    },
    'when player has 2 station cards and adds 3 damage own station card requirements of count 1 should only add the first 2': function () {
        const state = createState({
            playerStateById: {
                'P2A': {
                    stationCards: [{ id: 'S1A', place: 'draw' }, { id: 'S2A', place: 'draw' }]
                }
            }
        });
        const service = createServiceForPlayer(state, 'P1A', 'P2A');

        service.addCardRequirement({ type: 'damageStationCard', count: 1 });
        service.addCardRequirement({ type: 'damageStationCard', count: 1 });
        service.addCardRequirement({ type: 'damageStationCard', count: 1 });

        assert.equals(service.getRequirements(), [
            { type: 'damageStationCard', count: 1 },
            { type: 'damageStationCard', count: 1 }
        ]);
    }
});

function createServiceForPlayer(state, playerId, opponentId) {
    const matchService = new MatchService();
    matchService.setState(state);
    const playerServiceProvider = PlayerServiceProvider();
    const cardFactory = new ServerCardFactory({ matchService, playerServiceProvider, getFreshState: () => state });
    const playerStateService = new PlayerStateService({ playerId, matchService, cardFactory });
    const opponentStateService = new PlayerStateService({ playerId: opponentId, matchService, cardFactory });
    const playerRequirementService = new PlayerRequirementService({ playerStateService, opponentStateService });
    playerServiceProvider.registerService(PlayerServiceProvider.TYPE.state, playerId, playerStateService);
    playerServiceProvider.registerService(PlayerServiceProvider.TYPE.requirement, playerId, playerRequirementService);

    return playerRequirementService;
}

function createState(options = {}) {
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
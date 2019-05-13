let bocha = require('bocha');
let assert = bocha.assert;
let defaults = bocha.defaults;
const FakeCardDataAssembler = require("../../server/test/testUtils/FakeCardDataAssembler.js");//TODO Move to shared
const createCard = FakeCardDataAssembler.createCard;
const CardFactory = require('../card/CardFactory.js');
const PlayerStateService = require('../match/PlayerStateService.js');
const PlayerRuleService = require('../match/PlayerRuleService.js');
const MatchService = require('../match/MatchService.js');
const FakeDeckFactory = require('../../server/test/testUtils/FakeDeckFactory.js')
const PlayerServiceProvider = require('../match/PlayerServiceProvider.js');

module.exports = bocha.testCase('PlayerRuleService', {
    'max hand size:': {
        'when player has card that grants unlimited hand size should return Infinity': async function () {
            const cardFactory = {
                createCardForPlayer: cardData => {
                    if (cardData.id === 'C1A') return { id: 'C1A', type: 'duration', grantsUnlimitedHandSize: true };
                }
            };
            const playerState = createPlayerState({ cardsInZone: [createCard({ id: 'C1A' })] });
            const matchService = createMatchService({ getPlayerState: () => playerState })
            const playerStateService = new PlayerStateService({ matchService, cardFactory });
            const canThePlayer = { useThisDurationCard: cardId => cardId === 'C1A' };
            const service = new PlayerRuleService({ playerStateService, canThePlayer });

            const result = service.getMaximumHandSize();

            assert.equals(result, Infinity);
        },
        'when can NOT use duration cards player has DURATION card that grants unlimited hand size should NOT return Infinity': async function () {
            const cardFactory = {
                createCardForPlayer: cardData => {
                    if (cardData.id === 'C1A') return { id: 'C1A', type: 'duration', grantsUnlimitedHandSize: true };
                }
            };
            const playerState = createPlayerState({ cardsInZone: [createCard({ id: 'C1A' })], stationCards: [] });
            const matchService = createMatchService({ getPlayerState: () => playerState })
            const playerStateService = new PlayerStateService({ matchService, cardFactory });
            const canThePlayer = { useThisDurationCard: cardId => cardId !== 'C1A' };
            const service = new PlayerRuleService({ playerStateService, canThePlayer });

            const result = service.getMaximumHandSize();

            assert.equals(result, 0);
        },
        'when player has 1 station card in hand size position should return 3': async function () {
            const service = createServiceForPlayer('P1A', createState({
                playerStateById: {
                    'P1A': {
                        stationCards: [{ place: 'handSize' }]
                    }
                }
            }));

            const result = service.getMaximumHandSize();

            assert.equals(result, 3);
        },
        'when player has 2 station card in hand size position should return 6': async function () {
            const service = createServiceForPlayer('P1A', createState({
                playerStateById: {
                    'P1A': {
                        stationCards: [{ place: 'handSize' }, { place: 'handSize' }]
                    }
                }
            }));

            const result = service.getMaximumHandSize();

            assert.equals(result, 6);
        }
    }
});

function createMatchService(stubs = {}) {
    return {
        getPlayerState: () => createPlayerState(),
        ...stubs
    }
}

function createServiceForPlayer(playerId, state) {
    const matchService = new MatchService();
    matchService.setState(state);
    const playerServiceProvider = PlayerServiceProvider();
    const cardFactory = new CardFactory({ matchService, playerServiceProvider });
    const playerStateService = new PlayerStateService({ playerId, matchService, cardFactory });
    playerServiceProvider.registerService(PlayerServiceProvider.TYPE.state, playerId, playerServiceProvider);
    const canThePlayer = { useThisDurationCard() {} };
    return new PlayerRuleService({ playerStateService, canThePlayer });
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

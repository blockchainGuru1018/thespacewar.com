const {
    testCase,
    assert,
    refute,
    stub
} = require('bocha');
const createState = require('./fakeFactories/createState.js');
const FakeCardDataAssembler = require("../../server/test/testUtils/FakeCardDataAssembler.js");//TODO Move to shared
const createCard = FakeCardDataAssembler.createCard;
const CardFactory = require('../card/CardFactory.js');
const PlayerStateService = require('../match/PlayerStateService.js');
const BaseCard = require('../card/BaseCard.js');
const MatchService = require('../match/MatchService.js');
const PlayerServiceProvider = require('../match/PlayerServiceProvider.js');
const TestHelper = require('./fakeFactories/TestHelper.js');

const FullForceForwardCommonId = '9';

module.exports = testCase('PlayerStateService', {
    'cardCanMoveOnTurnWhenPutDown:': {
        'should return false': function () {
            const C1A = createCard({ id: 'C1A', type: 'spaceShip' });
            const card = new BaseCard({ card: C1A });
            const state = createState({
                playerStateById: {
                    'P1A': {
                        cardsInZone: [C1A]
                    }
                }
            });
            const service = createServiceForPlayer(state, 'P1A');

            const result = service.cardCanMoveOnTurnWhenPutDown(card);

            refute(result);
        },
        'when card is space ship has Full Force Forward in zone should return true': function () {
            const C1A = createCard({ id: 'C1A', type: 'spaceShip' });
            const card = new BaseCard({ card: C1A });
            const state = createState({
                playerStateById: {
                    'P1A': {
                        cardsInZone: [
                            C1A,
                            createCard({ id: 'C2A', type: 'duration', commonId: FullForceForwardCommonId })
                        ]
                    }
                }
            });
            const service = createServiceForPlayer(state, 'P1A');

            const result = service.cardCanMoveOnTurnWhenPutDown(card);

            assert(result);
        },
        'when has Full Force Forward in zone but card is NOT space ship should return false': function () {
            const C1A = createCard({ id: 'C1A', type: 'missile' });
            const card = new BaseCard({ card: C1A });
            const state = createState({
                playerStateById: {
                    'P1A': {
                        cardsInZone: [
                            C1A,
                            createCard({ id: 'C2A', type: 'duration', commonId: FullForceForwardCommonId })
                        ]
                    }
                }
            });
            const service = createServiceForPlayer(state, 'P1A');

            const result = service.cardCanMoveOnTurnWhenPutDown(card);

            refute(result);
        }
    },
    'removeCardFromDeck:': {
        'should remove card from deck': function () {
            const testHelper = TestHelper(createState({
                playerStateById: {
                    'P1A': {
                        cardsInDeck: [{ id: 'C2A' }, { id: 'C1A' }, { id: 'C3A' }]
                    }
                }
            }));
            const service = testHelper.playerStateService('P1A');

            service.removeCardFromDeck('C1A');

            const playerState = service.getPlayerState();
            assert.equals(playerState.cardsInDeck, [{ id: 'C2A' }, { id: 'C3A' }]);
        },
        'should return card': function () {
            const testHelper = TestHelper(createState({
                playerStateById: {
                    'P1A': {
                        cardsInDeck: [{ id: 'C1A' }]
                    }
                }
            }));
            const service = testHelper.playerStateService('P1A');

            const removedCard = service.removeCardFromDeck('C1A');

            assert.equals(removedCard.id, 'C1A');
        }
    },
    'removeCardFromDiscardPile': {
        'should remove card from discard pile': function () {
            const state = createState({
                playerStateById: {
                    'P1A': {
                        discardedCards: [{ id: 'C1A' }]
                    }
                }
            });
            const service = createServiceForPlayer(state, 'P1A');

            service.removeCardFromDiscardPile('C1A');

            assert.equals(service.getDiscardedCards(), []);
        },
        'should return removed card': function () {
            const state = createState({
                playerStateById: {
                    'P1A': {
                        discardedCards: [{ id: 'C1A' }]
                    }
                }
            });
            const service = createServiceForPlayer(state, 'P1A');

            const removedCard = service.removeCardFromDiscardPile('C1A');

            assert.equals(removedCard.id, 'C1A');
        },
        'should return null when card does NOT exist': function () {
            const state = createState();
            const service = createServiceForPlayer(state, 'P1A');

            const removedCard = service.removeCardFromDiscardPile('C1A');

            assert(removedCard === null, 'Expected null got: ' + removedCard);
        }
    }
});

function createFullForceForward(id) {
    return createCard({ id, type: 'duration', commonId: FullForceForwardCommonId });
}

function createServiceForPlayer(state, playerId) {
    const matchService = new MatchService();
    matchService.setState(state);
    const playerServiceProvider = PlayerServiceProvider();
    const cardFactory = new CardFactory({
        matchService,
        playerServiceProvider,
        playerServiceFactory: { addRequirementFromSpec: () => {} }
    });
    const playerStateService = new PlayerStateService({
        playerId,
        matchService,
        cardFactory
    });
    playerServiceProvider.registerService(PlayerServiceProvider.TYPE.state, playerId, playerServiceProvider);

    return playerStateService;
}

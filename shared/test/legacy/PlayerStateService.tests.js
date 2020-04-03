const {
    assert,
} = require('../testUtils/bocha-jest/bocha');
const createState = require('../fakeFactories/createState.js');
const FakeCardDataAssembler = require("../testUtils/FakeCardDataAssembler.js");
const createCard = FakeCardDataAssembler.createCard;
const CardFactory = require('../../card/CardFactory.js');
const PlayerStateService = require('../../match/PlayerStateService.js');
const MatchService = require('../../match/MatchService.js');
const PlayerServiceProvider = require('../../match/PlayerServiceProvider.js');
const TestHelper = require('../fakeFactories/TestHelper.js');

const FullForceForwardCommonId = '9';

module.exports = {
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
};

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
        playerServiceFactory: { addRequirementFromSpec: () => {}, turnControl: () => ({}) }
    });
    const playerStateService = new PlayerStateService({
        playerId,
        matchService,
        cardFactory
    });
    playerServiceProvider.registerService(PlayerServiceProvider.TYPE.state, playerId, playerServiceProvider);

    return playerStateService;
}

const {
    testCase,
    assert,
    refute,
    stub,
    sinon,
    defaults
} = require('bocha');
const FindCardController = require('../../match/controller/FindCardController.js');
const fakePlayerStateServiceFactory = require('../../../shared/test/fakeFactories/playerStateServiceFactory.js');

module.exports = testCase('FindCardController', {
    'when has selected 2 cards': {
        setUp() {
            this.playerRequirementUpdater = {
                canProgressRequirementByCount: () => true,
                progressRequirementByCount: stub()
            };
            this.playerStateService = fakePlayerStateServiceFactory.withStubs({
                removeCardFromDeck: stub().returns({ id: 'C1A' }),
                removeCardFromDiscardPile: stub().returns({ id: 'C2A' }),
                putDownCardInZone: stub()
            });
            let playerServiceProvider = {
                getStateServiceById: stub().returns(this.playerStateService)
            };
            this.playerRequirementUpdaterFactory = {
                create: stub().returns(this.playerRequirementUpdater)
            };
            const controller = Controller({
                playerRequirementUpdaterFactory: this.playerRequirementUpdaterFactory,
                playerServiceProvider
            });

            controller.onSelectCard('P1A', {
                cardGroups: [
                    { source: 'deck', cardIds: ['C1A'] },
                    { source: 'discardPile', cardIds: ['C2A'] }
                ]
            });
        },
        'should progress requirement count'() {
            assert.calledWith(this.playerRequirementUpdater.progressRequirementByCount, 2);
        },
        'should remove card from deck'() {
            assert.calledOnce(this.playerStateService.removeCardFromDeck);
            assert.calledWith(this.playerStateService.removeCardFromDeck, 'C1A');
        },
        'should remove card from discard pile'() {
            assert.calledOnce(this.playerStateService.removeCardFromDiscardPile);
            assert.calledWith(this.playerStateService.removeCardFromDiscardPile, 'C2A');
        },
        'should add cards to home zone'() {
            assert.calledTwice(this.playerStateService.putDownCardInZone);
            assert.calledWith(this.playerStateService.putDownCardInZone, sinon.match({ id: 'C1A' }), { grantedForFreeByEvent: true });
            assert.calledWith(this.playerStateService.putDownCardInZone, sinon.match({ id: 'C2A' }), { grantedForFreeByEvent: true });
        },
        'should create requirement updater correctly'() {
            assert.calledWith(this.playerRequirementUpdaterFactory.create, 'P1A', { type: 'findCard' });
        }
    },
    'checks if can progress requirement correctly': function () {
        const playerRequirementUpdater = {
            canProgressRequirementByCount: stub().returns(true),
            progressRequirementByCount: stub()
        };
        const controller = Controller({
            playerRequirementUpdaterFactory: {
                create: () => playerRequirementUpdater
            }
        });

        controller.onSelectCard('P1A', { cardGroups: [{ source: 'deck', cardIds: ['C1A'] }] });

        assert.calledWith(playerRequirementUpdater.canProgressRequirementByCount, 1);
    },
    'when has find card requirement': {
        'when can NOT progress requirement': {
            async setUp() {
                this.playerStateService = fakePlayerStateServiceFactory.withStubs({
                    removeCardFromDeck: stub()
                });
                this.playerRequirementUpdater = {
                    canProgressRequirementByCount: () => false,
                    progressRequirementByCount: stub()
                };
                const controller = Controller({
                    playerRequirementUpdaterFactory: {
                        create: () => this.playerRequirementUpdater
                    },
                    playerServiceProvider: {
                        getStateServiceById: () => this.playerStateService
                    }
                });

                let options = {
                    cardGroups: [
                        { source: 'deck', cardIds: ['C1A'] },
                        { source: 'discardPile', cardIds: ['C2A'] }
                    ]
                };
                this.error = catchError(() => controller.onSelectCard('P1A', options));
            },
            'should throw'() {
                assert(this.error);
                assert.equals(this.error.message, 'Cannot select more cards than required');
            },
            'should NOT remove card'() {
                refute.called(this.playerStateService.removeCardFromDeck);
            },
            'should NOT progress requirement'() {
                refute.called(this.playerRequirementUpdater.progressRequirementByCount);
            }
        }
    }
});

function Controller(deps = {}) {
    defaults(deps, {
        playerServiceProvider: {
            getStateServiceById: () => fakePlayerStateServiceFactory.withStubs()
        }
    });
    return FindCardController(deps);
}

function catchError(callback) {
    try {
        callback();
    }
    catch (error) {
        return error;
    }
}
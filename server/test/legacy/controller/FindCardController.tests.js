const {
    assert,
    refute,
    stub,
    sinon,
    defaults
} = require('../../testUtils/bocha-jest/bocha');
const FindCardController = require('../../../match/controller/FindCardController.js');
const fakePlayerStateServiceFactory = require('../../../../shared/test/fakeFactories/playerStateServiceFactory.js');

const PlayerId = 'P1A';
const OpponentId = 'P2A';

module.exports = {
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
            const playerServiceProvider = {
                getStateServiceById: stub().returns(this.playerStateService),
                getRequirementServiceById: () => ({
                    getFirstMatchingRequirement: () => ({ target: 'homeZone' })
                })
            };
            this.playerRequirementUpdaterFactory = {
                create: stub().returns(this.playerRequirementUpdater)
            };
            const controller = Controller({
                playerRequirementUpdaterFactory: this.playerRequirementUpdaterFactory,
                playerServiceProvider,
                playerServiceFactory: {
                    actionLog: () => ({
                        opponentPlayedCards() {},
                        cardsDiscarded() {}
                    })
                }
            });

            controller.onSelectCard(PlayerId, {
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
            assert.calledWith(this.playerRequirementUpdaterFactory.create, PlayerId, { type: 'findCard' });
        }
    },
    'checks if can progress requirement correctly': function () {
        this.playerStateService = fakePlayerStateServiceFactory.withStubs({
            removeCardFromDeck: () => ({ id: 'C1A' })
        });
        const playerServiceProvider = {
            getStateServiceById: stub().returns(this.playerStateService),
            getRequirementServiceById: () => ({
                getFirstMatchingRequirement: () => ({ target: 'homeZone' })
            })
        };
        const playerRequirementUpdater = {
            canProgressRequirementByCount: stub().returns(true),
            progressRequirementByCount: stub()
        };
        const controller = Controller({
            playerRequirementUpdaterFactory: {
                create: () => playerRequirementUpdater
            },
            playerServiceProvider
        });

        controller.onSelectCard(PlayerId, { cardGroups: [{ source: 'deck', cardIds: ['C1A'] }] });

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

                const options = {
                    cardGroups: [
                        { source: 'deck', cardIds: ['C1A'] },
                        { source: 'discardPile', cardIds: ['C2A'] }
                    ]
                };
                this.error = catchError(() => controller.onSelectCard(PlayerId, options));
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
    },
    'when select 1 card from action station cards and target is hand': {
        setUp() {
            this.playerStateService = fakePlayerStateServiceFactory.withStubs({
                removeStationCard: stub().returns({ card: { id: 'C1A' } }),
                addCardToHand: stub()
            });
            const playerServiceProvider = {
                getStateServiceById: stub().returns(this.playerStateService),
                getRequirementServiceById: () => ({
                    getFirstMatchingRequirement: () => ({ target: 'hand' })
                })
            };
            const controller = Controller({ playerServiceProvider });

            controller.onSelectCard(PlayerId, {
                cardGroups: [
                    { source: 'actionStationCards', cardIds: ['C1A'] }
                ]
            });
        },
        'should remove card from action station cards'() {
            assert.calledOnce(this.playerStateService.removeStationCard);
            assert.calledWith(this.playerStateService.removeStationCard, 'C1A');
        },
        'should add card to home zone'() {
            assert.calledOnce(this.playerStateService.addCardToHand);
            assert.calledWith(this.playerStateService.addCardToHand, sinon.match({ id: 'C1A' }));
        }
    },
    'when select card in opponents home zone and target is opponent discard pile': {
        setUp() {
            this.playerStateService = fakePlayerStateServiceFactory.withStubs({
                removeCardFromAnySource: stub().returns({ id: 'C1A' })
            });
            this.opponentStateService = fakePlayerStateServiceFactory.withStubs({
                removeCardFromHomeZone: stub().returns({ id: 'C2A' }),
                discardCard: stub()
            });
            const playerServiceProvider = FakePlayerServiceProvider({
                playerStateService: this.playerStateService,
                opponentStateService: this.opponentStateService,
                playerRequirementService: FakeRequirementService({
                    firstMatchingRequirement: {
                        target: 'opponentDiscardPile'
                    }
                })
            });
            const controller = Controller({ playerServiceProvider });

            controller.onSelectCard(PlayerId, {
                cardGroups: [
                    { source: 'opponentCardsInZone', cardIds: ['C2A'] }
                ]
            });
        },
        'should discard opponent card'() {
            assert.calledOnce(this.opponentStateService.discardCard);
            assert.calledWith(this.opponentStateService.discardCard, sinon.match({ id: 'C2A' }));
        },
        'should remove opponent card from opponents home zone'() {
            assert.calledOnce(this.opponentStateService.removeCardFromHomeZone);
            assert.calledWith(this.opponentStateService.removeCardFromHomeZone, 'C2A');
        }
    },
    'when requirement is card used dormant effect and is set to be destroyed': {
        setUp() {
            this.playerStateService = fakePlayerStateServiceFactory.withStubs({
                findCardFromAnySource: () => ({ id: 'C1A', commonId: 'C1B' }),
                removeCardFromAnySource: stub().returns({ id: 'C1A', commonId: 'C1B' }),
                discardCard: stub()
            });
            this.opponentActionLog = FakeActionLog({
                opponentTriggeredCard: stub()
            });
            const controller = Controller({
                playerServiceProvider: FakePlayerServiceProvider({
                    playerStateService: this.playerStateService,
                    opponentStateService: fakePlayerStateServiceFactory.withStubs({ removeCardFromHomeZone: () => ({}) }),
                    playerRequirementService: FakeRequirementService({
                        firstMatchingRequirement: {
                            target: 'opponentDiscardPile',
                            usedDormantEffect: {
                                cardId: 'C1A',
                                destroyCard: true
                            }
                        }
                    })
                }),
                playerServiceFactory: {
                    actionLog: () => this.opponentActionLog
                }
            });

            controller.onSelectCard(PlayerId, { cardGroups: [{ source: 'opponentCardsInZone', cardIds: ['C2A'] }] });
        },
        'should remove triggered card from player'() {
            assert.calledOnce(this.playerStateService.removeCardFromAnySource);
            assert.calledWith(this.playerStateService.removeCardFromAnySource, 'C1A');
        },
        'should discard players triggered card'() {
            assert.calledOnce(this.playerStateService.discardCard);
            assert.calledWith(this.playerStateService.discardCard, sinon.match({ id: 'C1A' }));
        },
        'should append to action log'() {
            assert.calledOnce(this.opponentActionLog.opponentTriggeredCard);
            assert.calledWith(this.opponentActionLog.opponentTriggeredCard, sinon.match({
                id: 'C1A',
                commonId: 'C1B'
            }));
        }
    },
    'when requirement is card used dormant effect and is set to NOT be destroyed': {
        setUp() {
            this.playerStateService = fakePlayerStateServiceFactory.withStubs({
                removeCardFromAnySource: stub().returns({ id: 'C1A' })
            });
            const playerServiceProvider = FakePlayerServiceProvider({
                playerStateService: this.playerStateService,
                opponentStateService: fakePlayerStateServiceFactory.withStubs({ removeCardFromHomeZone: () => ({}) }),
                playerRequirementService: FakeRequirementService({
                    firstMatchingRequirement: {
                        target: 'opponentDiscardPile',
                        usedDormantEffect: {
                            cardId: 'C1A',
                            destroyCard: false
                        }
                    }
                })
            });
            const controller = Controller({ playerServiceProvider });

            controller.onSelectCard(PlayerId, { cardGroups: [{ source: 'opponentCardsInZone', cardIds: ['C2A'] }] });
        },
        'should NOT remove triggered card from player'() {
            refute.called(this.playerStateService.removeCardFromAnySource);
        }
    }
};

function FakePlayerServiceProvider({ playerStateService, playerRequirementService, opponentStateService }) {
    return {
        getStateServiceById: playerId => {
            if (playerId === PlayerId) return playerStateService;
            return opponentStateService;
        },
        getRequirementServiceById: () => playerRequirementService
    };
}

function FakeRequirementService({ firstMatchingRequirement }) {
    return { getFirstMatchingRequirement: () => firstMatchingRequirement };
}

function Controller(deps = {}) {
    defaults(deps, {
        playerServiceProvider: {},
        playerRequirementUpdaterFactory: {
            create: () => ({
                canProgressRequirementByCount: () => true,
                progressRequirementByCount: stub()
            })
        },
        playerServiceFactory: {
            actionLog: () => FakeActionLog()
        },
        matchService: {
            getOpponentId(playerId) {
                if (playerId === PlayerId) return OpponentId;
                return PlayerId;
            }
        },
        stateMemento: {
            saveStateForCardId() {}
        }
    });

    defaults(deps.playerServiceProvider, {
        getStateServiceById: () => fakePlayerStateServiceFactory.withStubs(),
        getRequirementServiceById: () => ({
            getFirstMatchingRequirement: () => null
        }),
        removeCardFromHomeZone() {}
    });

    return FindCardController(deps);
}

function FakeActionLog(stubs) {
    return {
        opponentPlayedCards() {},
        cardsDiscarded() {},
        opponentTriggeredCard() {},
        ...stubs
    };
}

function catchError(callback) {
    try {
        callback();
    }
    catch (error) {
        return error;
    }
}

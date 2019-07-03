const {
    bocha: {
        sinon,
        assert,
        refute,
    },
    createCard,
    createState,
    createMatch,
    Player,
    FakeDeck,
    FakeConnection2,
    catchError
} = require('./shared.js');

module.exports = {
    'when is action phase and first player discards card': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)];
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C1A' })]
                    }
                }
            }));

            this.error = catchError(() => this.match.discardCard('P1A', 'C1A'));
        },
        'should throw an error'() {
            assert(this.error);
            assert.equals(this.error.message, 'Illegal discard');
        },
        'should NOT emit state changed to first player'() {
            refute.called(this.firstPlayerConnection.stateChanged);
        }
    },
    'when is discard phase and first player discards card': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)];
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'discard',
                        cardsOnHand: [createCard({ id: 'C1A' })]
                    }
                }
            }));

            this.match.discardCard('P1A', 'C1A');
        },
        'should emit state changed to first player'() {
            assert.calledOnce(this.firstPlayerConnection.stateChanged);
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                discardedCards: [sinon.match({ id: 'C1A' })]
            }));
        },
        'should emit state changed to second player'() {
            assert.calledOnce(this.secondPlayerConnection.stateChanged);
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                opponentDiscardedCards: [sinon.match({ id: 'C1A' })]
            }));
        }
    },
    'when discard card in action phase and has discard card requirement of 2 cards': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C1A' })],
                        requirements: [{ type: 'discardCard', count: 2 }]
                    }
                },
                deckByPlayerId: {
                    'P2A': FakeDeck.fromCards([createCard({ id: 'C2A' })])
                }
            }));

            this.match.discardCard('P1A', 'C1A');
        },
        'should emit updated requirement to first player'() {
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                requirements: [{ type: 'discardCard', count: 1 }]
            }));
        },
        'first player should NOT have discarded card on hand'() {
            this.match.refresh('P1A');
            const { cardsOnHand } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
            assert.equals(cardsOnHand.length, 0);
        },
        'first player should have requirement to discard 1 card'() {
            this.match.refresh('P1A');
            const { requirements } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
            assert.equals(requirements.length, 1);
            assert.equals(requirements[0], { type: 'discardCard', count: 1 });
        },
        'should emit state changed to second player WITHOUT bonus card'() {
            assert.calledOnce(this.secondPlayerConnection.stateChanged);
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                opponentDiscardedCards: [sinon.match({ id: 'C1A' })]
            }));
            refute.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                cardsOnHand: [sinon.match({ id: 'C2A' })]
            }));
        }
    },
    'when discard card in action phase and has discard card requirement of 1 card BUT it is after another requirement': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C1A' })],
                        requirements: [{ type: 'otherType', count: 3 }, { type: 'discardCard', count: 1 }]
                    }
                }
            }));

            this.error = catchError(() => this.match.discardCard('P1A', 'C1A'));
        },
        'should NOT emit changes to first player'() {
            refute.called(this.firstPlayerConnection.stateChanged);
        },
        'should throw error'() {
            assert(this.error);
            assert.equals(this.error.message, 'Illegal discard');
        }
    },
    'when discard card in action phase and has discard card requirement of 1 card': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C1A' })],
                        requirements: [{ type: 'discardCard', count: 1 }, { type: 'otherType', count: 3 }]
                    }
                }
            }));

            this.match.discardCard('P1A', 'C1A');
        },
        'should emit requirements list without discard card requirement to first player'() {
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                requirements: [{ type: 'otherType', count: 3 }]
            }));
        },
        'first player should NOT have requirement to discard 1 card'() {
            this.match.refresh('P1A');
            const { requirements } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
            assert.equals(requirements.length, 1);
            assert.equals(requirements[0], { type: 'otherType', count: 3 });
        }
    },
    'when discard last card of requirement but has 2 other requirements': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C1A' })],
                        requirements: [
                            { type: 'discardCard', count: 1 },
                            { type: 'discardCard' },
                            { type: 'third' },
                            { type: 'fourth' },
                        ]
                    }
                }
            }));

            this.match.discardCard('P1A', 'C1A');
        },
        'should emit requirements list without first discard card requirement to first player'() {
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                requirements: [{ type: 'discardCard' }, { type: 'third' }, { type: 'fourth' }]
            }));
        }
    },
    'when discard last card of common requirement': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C1A' })],
                        requirements: [{ type: 'discardCard', count: 1, common: true }]
                    },
                    'P2A': {
                        cardsOnHand: [createCard({ id: 'C2A' })],
                        requirements: [{ type: 'discardCard', count: 1, common: true }]
                    }
                }
            }));

            this.match.discardCard('P1A', 'C1A');
        },
        'should emit requirement as waiting to first player'() {
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                requirements: [{ type: 'discardCard', count: 0, common: true, waiting: true }]
            }));
        }
    },
    'when first player discard last card of common requirement where second player is waiting': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C1A' })],
                        requirements: [{ type: 'discardCard', count: 1, common: true }]
                    },
                    'P2A': {
                        cardsOnHand: [createCard({ id: 'C2A' })],
                        requirements: [{ type: 'discardCard', count: 1, common: true, waiting: true }]
                    }
                }
            }));

            this.match.discardCard('P1A', 'C1A');
        },
        'should emit an empty array of requirements to first player'() {
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                requirements: []
            }));
        },
        'should emit an empty array of requirements to second player'() {
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                requirements: []
            }));
        }
    }
};

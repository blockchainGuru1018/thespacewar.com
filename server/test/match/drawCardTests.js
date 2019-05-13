const {
    bocha: {
        assert,
        refute,
        sinon
    },
    createCard,
    Player,
    createMatch,
    FakeConnection2,
    createState,
} = require('./shared.js');
const FakeDeck = require('../testUtils/FakeDeck.js');

module.exports = {
    'when in draw phase and has 1 card in station draw-row': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['drawCards', 'stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)];
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        stationCards: [{ place: 'draw', card: createCard() }],
                    }
                },
                deckByPlayerId: {
                    'P1A': FakeDeck.fromCards([
                        createCard({ id: 'C1A' }),
                        createCard({ id: 'C2A' }),
                    ])
                }
            }));

            this.match.drawCard('P1A');
        },
        'should emit drawCards to first player'() {
            assert.calledOnce(this.firstPlayerConnection.drawCards);
            assert.calledWith(this.firstPlayerConnection.drawCards, sinon.match({
                moreCardsCanBeDrawn: false
            }));
        },
        'first player should have new card on hand'() {
            this.match.refresh('P1A');
            const { cardsOnHand } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
            assert.equals(cardsOnHand.length, 1);
            assert.equals(cardsOnHand[0].id, 'C1A');
        },
        'should emit stateChanged to first player'() {
            assert.calledOnce(this.firstPlayerConnection.stateChanged);
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                cardsOnHand: [sinon.match({ id: 'C1A' })]
            }));
        },
        'should emit stateChanged to second player'() {
            assert.calledOnce(this.secondPlayerConnection.stateChanged);
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                opponentCardCount: 1
            }));
        }
    },
    'when in draw phase and has 2 cards in station draw-row': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['drawCards', 'stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        stationCards: [
                            { place: 'draw', card: createCard() },
                            { place: 'draw', card: createCard() }
                        ],
                    }
                },
                deckByPlayerId: {
                    'P1A': FakeDeck.fromCards([
                        createCard({ id: 'C1A' }),
                        createCard({ id: 'C2A' }),
                    ])
                }
            }));

            this.match.drawCard('P1A');
        },
        'should emit drawCards to first player'() {
            assert.calledOnce(this.firstPlayerConnection.drawCards);
            assert.calledWith(this.firstPlayerConnection.drawCards, sinon.match({
                moreCardsCanBeDrawn: true
            }));
        },
        'first player should have new card on hand'() {
            this.match.refresh('P1A');
            const { cardsOnHand } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
            assert.equals(cardsOnHand.length, 1);
            assert.equals(cardsOnHand[0].id, 'C1A');
        },
        'should emit stateChanged to first player'() {
            assert.calledOnce(this.firstPlayerConnection.stateChanged);
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                cardsOnHand: [sinon.match({ id: 'C1A' })]
            }));
        },
        'should emit stateChanged to second player'() {
            assert.calledOnce(this.secondPlayerConnection.stateChanged);
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                opponentCardCount: 1
            }));
        }
    },
    'when can draw 1 card and draws 2 cards': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['drawCards']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)];
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        stationCards: [{ place: 'draw', card: createCard() }],
                    }
                },
                deckByPlayerId: {
                    'P1A': FakeDeck.fromCards([createCard({ id: 'C1A' })])
                }
            }));

            this.match.drawCard('P1A');
            this.match.drawCard('P1A');
        },
        'should emit NO cards and that there are no more cards to draw'() {
            const args = this.firstPlayerConnection.drawCards.lastCall.args[0];
            assert.equals(args, { moreCardsCanBeDrawn: false });
        }
    },
    'when has NO more cards but has 1 draw row station card and draws 1 card': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['drawCards']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)];
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        stationCards: [{ place: 'draw', card: createCard() }]
                    }
                },
                deckByPlayerId: {
                    'P1A': FakeDeck.fromCards([])
                }
            }));

            this.match.drawCard('P1A');
        },
        'should emit NO cards and that there are no more cards to draw'() {
            const args = this.firstPlayerConnection.drawCards.lastCall.args[0];
            assert.equals(args, { moreCardsCanBeDrawn: false });
        }
    },
    'when discard opponent top 2 cards and has more cards to draw': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['drawCards', 'stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged', 'setOpponentCardCount']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)];
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        stationCards: [
                            { place: 'draw', card: createCard() },
                            { place: 'draw', card: createCard() }
                        ],
                    }
                },
                deckByPlayerId: {
                    'P2A': FakeDeck.fromCards([
                        createCard({ id: 'C2A' }),
                        createCard({ id: 'C3A' }),
                    ])
                }
            }));

            this.match.discardOpponentTopTwoCards('P1A');
        },
        'should emit drawCards to first player'() {
            assert.calledOnce(this.firstPlayerConnection.drawCards);
            assert.calledWith(this.firstPlayerConnection.drawCards, sinon.match({ moreCardsCanBeDrawn: true }));
        },
        'first player should NOT have new card on hand'() {
            this.match.refresh('P1A');
            const { cardsOnHand } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
            assert.equals(cardsOnHand.length, 0);
        },
        'should NOT emit setOpponentCardCount to second player'() {
            refute.called(this.secondPlayerConnection.setOpponentCardCount);
        },
        'should emit stateChanged to first player'() {
            assert.calledOnce(this.firstPlayerConnection.stateChanged);
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                opponentDiscardedCards: [
                    sinon.match({ id: 'C2A' }),
                    sinon.match({ id: 'C3A' })
                ],
                events: [sinon.match({ type: 'drawCard' })]
            }));
        },
        'should emit stateChanged to second player'() {
            assert.calledOnce(this.secondPlayerConnection.stateChanged);
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                discardedCards: [
                    sinon.match({ id: 'C2A' }),
                    sinon.match({ id: 'C3A' })
                ],
                events: [
                    sinon.match({ type: 'discardCard' }),
                    sinon.match({ type: 'discardCard' })
                ]
            }));
        }
    },
    'when has draw card requirement with count 1 and draw card': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['drawCards', 'stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged', 'setOpponentCardCount']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        requirements: [{ type: 'drawCard', count: 1 }]
                    }
                },
                deckByPlayerId: {
                    'P1A': FakeDeck.fromCards([createCard({ id: 'C1A' })])
                }
            }));

            this.match.drawCard('P1A');
        },
        'should emit state changed with requirement removed'() {
            assert.calledOnce(this.firstPlayerConnection.stateChanged);
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                cardsOnHand: [createCard({ id: 'C1A' })],
                events: [sinon.match({ type: 'drawCard', byEvent: true })],
                requirements: []
            }));
        },
        'should emit state changed to second player'() {
            assert.calledOnce(this.secondPlayerConnection.stateChanged);
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                opponentCardCount: 1
            }));
        }
    },
    'when has draw card requirement with count 1 and mill opponent': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['drawCards', 'stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged', 'setOpponentCardCount']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        requirements: [{ type: 'drawCard', count: 1 }]
                    }
                },
                deckByPlayerId: {
                    'P2A': FakeDeck.fromCards([
                        createCard({ id: 'C1A' }),
                        createCard({ id: 'C2A' })
                    ])
                }
            }));

            this.match.discardOpponentTopTwoCards('P1A');
        },
        'should emit state changed with requirement removed'() {
            assert.calledOnce(this.firstPlayerConnection.stateChanged);
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                requirements: []
            }));
        },
        'should emit state changed to second player'() {
            assert.calledOnce(this.secondPlayerConnection.stateChanged);
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                discardedCards: [sinon.match({ id: 'C1A' }), sinon.match({ id: 'C2A' })]
            }));
        }
    },
    'when has draw card requirement with count 2 and draw card': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['drawCards', 'stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged', 'setOpponentCardCount']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        requirements: [{ type: 'drawCard', count: 2 }]
                    }
                }
            }));

            this.match.drawCard('P1A');
        },
        'should emit state changed with requirement updated'() {
            assert.calledOnce(this.firstPlayerConnection.stateChanged);
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                requirements: [{ type: 'drawCard', count: 1 }]
            }));
        }
    },
    'when has COMMON draw card requirement with count 1 and draw card and second player is NOT waiting': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A')];
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        requirements: [{ type: 'drawCard', count: 1, common: true }]
                    },
                    'P2A': {
                        phase: 'wait',
                        requirements: [{ type: 'drawCard', count: 1, common: true }]
                    }
                }
            }));

            this.match.drawCard('P1A');
        },
        'should emit state changed with requirement updated to first player'() {
            assert.calledOnce(this.firstPlayerConnection.stateChanged);
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                requirements: [{ type: 'drawCard', count: 0, common: true, waiting: true }]
            }));
        }
    },
    'when has COMMON draw card requirement with count 1 and draw card and second player is waiting': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'draw',
                        requirements: [{ type: 'drawCard', count: 1, common: true }]
                    },
                    'P2A': {
                        phase: 'wait',
                        requirements: [{ type: 'drawCard', count: 0, common: true, waiting: true }]
                    }
                }
            }));

            this.match.drawCard('P1A');
        },
        'should emit state changed WITHOUT requirement to first player'() {
            assert.calledOnce(this.firstPlayerConnection.stateChanged);
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                requirements: []
            }));
        },
        'should emit state changed WITHOUT requirement to second player'() {
            assert.calledOnce(this.secondPlayerConnection.stateChanged);
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                requirements: []
            }));
        }
    }
};

const {
    bocha: {
        assert,
        refute,
        sinon
    },
    createCard,
    createDeckFromCards,
    Player,
    createMatch,
    FakeConnection2,
    catchError,
    createState,
} = require('./shared.js');
let PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');
let MoveCardEvent = require('../../../shared/event/MoveCardEvent.js');

module.exports = {
    'when first player is in attack phase and moves card': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.secondPlayerConnection = FakeConnection2(['opponentMovedCard', 'restoreState']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                turn: 2,
                playerStateById: {
                    'P1A': {
                        phase: 'attack',
                        cardsInZone: [createCard({ id: 'C1A' })],
                        events: [{ type: 'putDownCard', cardId: 'C1A', turn: 1 }]
                    }
                }
            }));

            this.match.moveCard('P1A', 'C1A');
        },
        'should emit opponentMovedCard'() {
            assert.calledOnce(this.secondPlayerConnection.opponentMovedCard);
            assert.calledWith(this.secondPlayerConnection.opponentMovedCard, 'C1A');
        },
        'when restore state for first player should NOT have moved card in own zone'() {
            this.match.start();
            const state = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(state.cardsInZone.length, 0);
        },
        'when restore state for first player should have moved card in playerCardsInOpponentZone'() {
            this.match.start();
            const state = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(state.cardsInOpponentZone.length, 1);
            assert.match(state.cardsInOpponentZone[0], { id: 'C1A' });
        },
        'when restore state for first player should have a move card event'() {
            this.match.start();
            const state = this.firstPlayerConnection.restoreState.lastCall.args[0];
            const moveCardEvents = state.events.filter(e => e.type === 'moveCard');
            assert.equals(moveCardEvents.length, 1);
            assert.match(moveCardEvents[0], { cardId: 'C1A' });
        },
        'when restore state for second player should have card in opponentCardsInPlayerZone'() {
            this.match.start();
            let state = this.secondPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(state.opponentCardsInPlayerZone.length, 1);
            assert.match(state.opponentCardsInPlayerZone[0], { id: 'C1A' });
        }
    },
    'when try to move card on the same turn it was put down should throw error': async function () {
        this.match = createMatch({ players: [Player('P1A'), Player('P2A')] });
        this.match.restoreFromState(createState({
            turn: 1,
            currentPlayer: 'P1A',
            playerOrder: ['P1A', 'P2A'],
            playerStateById: {
                'P1A': {
                    phase: 'attack',
                    cardsInZone: [createCard({ id: 'C1A' })],
                    events: [{ type: 'putDownCard', cardId: 'C1A', turn: 1 }]
                }
            }
        }));

        let error = catchError(() => this.match.moveCard('P1A', 'C1A'));

        assert(error);
        assert.equals(error.message, 'Cannot move card');
    },
    'when first player attack card in opponents own zone': {
        async setUp() {
            this.secondPlayerConnection = FakeConnection2(['restoreState', 'opponentAttackedCard']);
            this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.secondPlayerConnection)] });
            this.match.restoreFromState(createState({
                turn: 2,
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'attack',
                        cardsInOpponentZone: [createCard({ id: 'C1A', attack: 1 })],
                        events: [MoveCardEvent({ turn: 1, cardId: 'C1A' })]
                    },
                    'P2A': {
                        cardsInZone: [createCard({ id: 'C2A' })],
                    }
                },
                deckByPlayerId: {
                    'P1A': createDeckFromCards([{ id: 'C1A' }]),
                    'P2A': createDeckFromCards([{ id: 'C2A' }])
                }
            }));

            this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' });
        },
        'when second player restore state should have damaged card still in own zone'() {
            this.match.start();
            const { cardsInZone } = this.secondPlayerConnection.restoreState.lastCall.args[0];
            const damagedCards = cardsInZone.filter(c => !!c.damage);
            assert.equals(damagedCards.length, 1);
            assert.equals(damagedCards[0].damage, 1);
        },
        'should emit opponentAttackedCard with card ids and damage amount'() {
            assert.calledWith(this.secondPlayerConnection.opponentAttackedCard, sinon.match({
                attackerCardId: 'C1A',
                defenderCardId: 'C2A',
                newDamage: 1
            }));
        }
    },
    'when first player attack card in own zone from opponents zone': {
        async setUp() {
            this.connection = FakeConnection2(['restoreState']);
            this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
            this.match.restoreFromState(createState({
                turn: 2,
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'attack',
                        cardsInOpponentZone: [createCard({ id: 'C1A', attack: 1 })],
                    },
                    'P2A': {
                        cardsInOpponentZone: [createCard({ id: 'C2A' })],
                    }
                },
                deckByPlayerId: {
                    'P1A': createDeckFromCards([{ id: 'C1A' }]),
                    'P2A': createDeckFromCards([{ id: 'C2A' }])
                }
            }));

            const attackOptions = { attackerCardId: 'C1A', defenderCardId: 'C2A' }
            this.error = catchError(() => this.match.attack('P1A', attackOptions));
        },
        'should throw error': function () {
            assert(this.error);
            assert.equals(this.error.message, 'Cannot attack that card');
        },
        'when second player restore state should have card undamaged and still in own zone'() {
            this.match.start();

            const { cardsInOpponentZone } = this.connection.restoreState.lastCall.args[0];
            assert(cardsInOpponentZone.some(c => c.id === 'C2A'));

            const damagedCards = cardsInOpponentZone.filter(c => !!c.damage);
            assert.equals(damagedCards.length, 0);
        }
    },
    'when first player attack but is NOT in attack phase': {
        async setUp() {
            this.connection = FakeConnection2(['restoreState']);
            this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
            this.match.restoreFromState(createState({
                turn: 2,
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'discard',
                        cardsInOpponentZone: [createCard({ id: 'C1A' })],
                    },
                    'P2A': {
                        cardsInZone: [createCard({ id: 'C2A' })],
                    }
                },
                deckByPlayerId: {
                    'P1A': createDeckFromCards([{ id: 'C1A' }]),
                    'P2A': createDeckFromCards([{ id: 'C2A' }])
                }
            }));

            const attackOptions = { attackerCardId: 'C1A', defenderCardId: 'C2A' }
            this.error = catchError(() => this.match.attack('P1A', attackOptions));
        },
        'should throw error': function () {
            assert(this.error);
            assert.equals(this.error.message, 'Cannot attack when not in attack phase');
        },
        'when second player restore state should have card undamaged and still in own zone'() {
            this.match.start();

            const { cardsInZone } = this.connection.restoreState.lastCall.args[0];
            assert(cardsInZone.some(c => c.id === 'C2A'));

            const damagedCards = cardsInZone.filter(c => !!c.damage);
            assert.equals(damagedCards.length, 0);
        }
    },
    'when first player attack card in opponent zone from own zone': {
        async setUp() {
            this.connection = FakeConnection2(['restoreState']);
            this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
            this.match.restoreFromState(createState({
                turn: 2,
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'attack',
                        cardsInZone: [createCard({ id: 'C1A', attack: 1 })],
                    },
                    'P2A': {
                        cardsInZone: [createCard({ id: 'C2A' })],
                    }
                },
                deckByPlayerId: {
                    'P1A': createDeckFromCards([{ id: 'C1A' }]),
                    'P2A': createDeckFromCards([{ id: 'C2A' }])
                }
            }));

            const attackOptions = { attackerCardId: 'C1A', defenderCardId: 'C2A' }
            this.error = catchError(() => this.match.attack('P1A', attackOptions));
        },
        'should throw error': function () {
            assert(this.error);
            assert.equals(this.error.message, 'Cannot attack that card');
        },
        'when second player restore state should have card undamaged and still in own zone'() {
            this.match.start();

            const { cardsInZone } = this.connection.restoreState.lastCall.args[0];
            assert(cardsInZone.some(c => c.id === 'C2A'));

            const damagedCards = cardsInZone.filter(c => !!c.damage);
            assert.equals(damagedCards.length, 0);
        }
    },
    'when first player attack card in own zone': {
        async setUp() {
            this.connection = FakeConnection2(['restoreState']);
            this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
            this.match.restoreFromState(createState({
                turn: 2,
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'attack',
                        cardsInZone: [createCard({ id: 'C1A', attack: 1 })],
                    },
                    'P2A': {
                        cardsInOpponentZone: [createCard({ id: 'C2A' })],
                        events: [MoveCardEvent({ turn: 1, cardId: 'C2A' })]
                    }
                },
                deckByPlayerId: {
                    'P1A': createDeckFromCards([{ id: 'C1A' }]),
                    'P2A': createDeckFromCards([{ id: 'C2A' }])
                }
            }));

            this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' });
        },
        'when second player restore state should have damaged card still in opponent zone'() {
            this.match.start();
            const { cardsInOpponentZone } = this.connection.restoreState.lastCall.args[0];
            const damagedCards = cardsInOpponentZone.filter(c => !!c.damage);
            assert.equals(damagedCards.length, 1);
            assert.equals(damagedCards[0].damage, 1);
        }
    },
    'when first player makes deadly attack should remove defending card from play': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['restoreState', 'stateChanged', 'opponentAttackedCard']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)];
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                turn: 2,
                currentPlayer: 'P1A',
                playerOrder: ['P1A', 'P2A'],
                playerStateById: {
                    'P1A': {
                        phase: 'attack',
                        cardsInZone: [createCard({ id: 'C1A', attack: 2 })]
                    },
                    'P2A': {
                        cardsInOpponentZone: [createCard({ id: 'C2A', defense: 1 })],
                        events: [MoveCardEvent({ turn: 1, cardId: 'C2A' })]
                    }
                }
            }));

            this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' });
        },
        'when second player restore state should NOT have attacked card'() {
            this.match.start();
            const { cardsInOpponentZone } = this.secondPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(cardsInOpponentZone.length, 0);
        },
        'when second player restore state should have attacked card in discard pile'() {
            this.match.start();
            const { discardedCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(discardedCards.length, 1);
            assert.equals(discardedCards[0].id, 'C2A');
        },
        'when first player restore state should have attacked card in opponents discard pile'() {
            this.match.start();
            const { opponentDiscardedCards } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(opponentDiscardedCards.length, 1);
            assert.equals(opponentDiscardedCards[0].id, 'C2A');
        },
        'should emit state changed to second player'() {
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                discardedCards: [sinon.match({ id: 'C2A' })],
                events: [
                    sinon.match({ type: 'moveCard', cardId: 'C2A' }),
                    sinon.match({ type: 'discardCard', cardId: 'C2A' })
                ]
            }));
        },
        'should emit state changed to first player'() {
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                opponentDiscardedCards: [sinon.match({ id: 'C2A' })]
            }));
        },
        'should emit opponent attacked card to second player'() {
            assert.calledWith(this.secondPlayerConnection.opponentAttackedCard, sinon.match({
                attackerCardId: 'C1A',
                defenderCardId: 'C2A',
                defenderCardWasDestroyed: true
            }));
        }
    },
    'when defender has 2 in defense and 1 in damage and first player attacks with card with 1 in attack': {
        async setUp() {
            this.connection = FakeConnection2(['restoreState', 'opponentAttackedCard']);
            this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
            this.match.restoreFromState(createState({
                turn: 2,
                currentPlayer: 'P1A',
                playerOrder: ['P1A', 'P2A'],
                playerStateById: {
                    'P1A': {
                        phase: 'attack',
                        cardsInZone: [createCard({ id: 'C1A', attack: 1 })],
                    },
                    'P2A': {
                        cardsInOpponentZone: [createCard({ id: 'C2A', defense: 2, damage: 1 })],
                        events: [MoveCardEvent({ turn: 1, cardId: 'C2A' })]
                    }
                }
            }));

            this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' });
        },
        'when second player restore state should NOT have attacked card'() {
            this.match.start();
            const { cardsInOpponentZone } = this.connection.restoreState.lastCall.args[0];
            assert.equals(cardsInOpponentZone.length, 0);
        },
        'should emit opponent attacked card and that defender card was destroyed'() {
            assert.calledWith(this.connection.opponentAttackedCard, sinon.match({
                attackerCardId: 'C1A',
                defenderCardId: 'C2A',
                defenderCardWasDestroyed: true
            }));
        }
    },
    'when defender has 3 in defense and 1 in damage and first player attacks with card with 1 in attack': {
        async setUp() {
            this.connection = FakeConnection2(['restoreState', 'opponentAttackedCard']);
            this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
            this.match.restoreFromState(createState({
                turn: 2,
                currentPlayer: 'P1A',
                playerOrder: ['P1A', 'P2A'],
                playerStateById: {
                    'P1A': {
                        phase: 'attack',
                        cardsInZone: [createCard({ id: 'C1A', attack: 1 })],
                    },
                    'P2A': {
                        cardsInOpponentZone: [createCard({ id: 'C2A', defense: 3, damage: 1 })],
                        events: [MoveCardEvent({ turn: 1, cardId: 'C2A' })]
                    }
                }
            }));

            this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' });
        },
        'when second player restore state should have damaged card still in opponent zone'() {
            this.match.start();
            const { cardsInOpponentZone } = this.connection.restoreState.lastCall.args[0];
            const damagedCards = cardsInOpponentZone.filter(c => !!c.damage);
            assert.equals(damagedCards.length, 1);
            assert.equals(damagedCards[0].damage, 2);
        },
        'should emit opponent attacked card'() {
            assert.calledOnce(this.connection.opponentAttackedCard);
            assert.calledWith(this.connection.opponentAttackedCard, sinon.match({
                attackerCardId: 'C1A',
                defenderCardId: 'C2A',
                newDamage: 2
            }));
        }
    },
    'when attacks twice with same card in same turn': {
        async setUp() {
            this.connection = FakeConnection2(['restoreState', 'opponentAttackedCard']);
            this.match = createMatch({ players: [Player('P1A'), Player('P2A', this.connection)] });
            this.match.restoreFromState(createState({
                turn: 2,
                currentPlayer: 'P1A',
                playerOrder: ['P1A', 'P2A'],
                playerStateById: {
                    'P1A': {
                        phase: 'attack',
                        cardsInZone: [createCard({ id: 'C1A', attack: 1 })],
                    },
                    'P2A': {
                        cardsInOpponentZone: [createCard({ id: 'C2A', defense: 2 })],
                        events: [MoveCardEvent({ turn: 1, cardId: 'C2A' })]
                    }
                }
            }));

            const attackOptions = { attackerCardId: 'C1A', defenderCardId: 'C2A' }
            this.match.attack('P1A', attackOptions);
            this.error = catchError(() => this.match.attack('P1A', attackOptions));
        },
        'should throw error'() {
            assert(this.error);
            assert.equals(this.error.message, 'Cannot attack with card');
        },
        'when second player restore state should still have attacked card'() {
            this.match.start();
            const { cardsInOpponentZone } = this.connection.restoreState.lastCall.args[0];
            assert.equals(cardsInOpponentZone.length, 1);
            assert.match(cardsInOpponentZone[0], { id: 'C2A' });
        },
        'should emit opponent attacked card only once'() {
            assert.calledOnce(this.connection.opponentAttackedCard);
            assert.calledWith(this.connection.opponentAttackedCard, sinon.match({
                attackerCardId: 'C1A',
                defenderCardId: 'C2A',
                newDamage: 1
            }));
        }
    },
    'when first player try to move defense card': {
        setUp() {
            this.match = createMatch({ players: [Player('P1A')] });
            this.match.restoreFromState(createState({
                turn: 2,
                currentPlayer: 'P1A',
                playerOrder: ['P1A', 'P2A'],
                playerStateById: {
                    'P1A': {
                        phase: 'attack',
                        cardsInZone: [createCard({ id: 'C1A', type: 'defense' })]
                    }
                }
            }));

            this.error = catchError(() => this.match.moveCard('P1A', 'C1A'));
        },
        'should throw error': function () {
            assert(this.error);
            assert.equals(this.error.message, 'Cannot move card');
        }
    },
    'missile cards:': {
        'when first player makes deadly attack with missile card': {
            async setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['restoreState', 'opponentAttackedCard', 'stateChanged']);
                this.match = createMatch({
                    players: [
                        Player('P1A', this.firstPlayerConnection),
                        Player('P2A', this.secondPlayerConnection)
                    ]
                });
                this.match.restoreFromState(createState({
                    turn: 1,
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A', attack: 2, type: 'missile' })]
                        },
                        'P2A': {
                            cardsInOpponentZone: [createCard({ id: 'C2A', defense: 1 })],
                            events: [MoveCardEvent({ turn: 1, cardId: 'C2A' })]
                        }
                    }
                }));

                this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' });
            },
            'when first player restore state should NOT have missile card'() {
                this.match.start();
                const { cardsInZone } = this.firstPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(cardsInZone.length, 0);
            },
            'when second player restore state should NOT have attacked card'() {
                this.match.start();
                const { cardsInOpponentZone } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(cardsInOpponentZone.length, 0);
            },
            'should emit opponent attacked card'() {
                assert.calledWith(this.secondPlayerConnection.opponentAttackedCard, sinon.match({
                    attackerCardId: 'C1A',
                    defenderCardId: 'C2A',
                    attackerCardWasDestroyed: true,
                    defenderCardWasDestroyed: true
                }));
            },
            'should emit state changed to first player'() {
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    opponentDiscardedCards: [sinon.match({ id: 'C2A' })],
                    discardedCards: [sinon.match({ id: 'C1A' })],
                    events: [
                        sinon.match({ type: 'attack', attackerCardId: 'C1A' }),
                        sinon.match({ type: 'discardCard', cardId: 'C1A' })
                    ]
                }));
            },
            'should emit state changed to second player'() {
                assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                    opponentDiscardedCards: [sinon.match({ id: 'C1A' })],
                    discardedCards: [sinon.match({ id: 'C2A' })],
                    events: [
                        sinon.match({ type: 'moveCard', cardId: 'C2A' }),
                        sinon.match({ type: 'discardCard', cardId: 'C2A' })
                    ]
                }));
            }
        },
        'when player attacks opponent station with missile card from own zone': {
            setUp() {
                this.match = createMatch({ players: [Player('P1A'), Player('P2A')] });
                this.match.restoreFromState(createState({
                    turn: 1,
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A', attack: 1, type: 'missile' })],
                            events: []
                        },
                        'P2A': {
                            stationCards: [
                                { card: createCard({ id: 'C2A' }), place: 'action' },
                                { card: createCard({ id: 'C3A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                this.error = catchError(() => {
                    this.match.attackStationCard('P1A', { attackerCardId: 'C1A', targetStationCardIds: ['C2A'] });
                });
            },
            'should throw an error'() {
                assert.defined(this.error);
                assert.equals(this.error.message, 'Can only attack station card from enemy zone');
            }
        },
        'when missile card attack station on the same turn it moved to zone': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)];
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    turn: 1,
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A', attack: 1, type: 'missile' })],
                            events: [MoveCardEvent({ turn: 1, cardId: 'C1A' })]
                        },
                        'P2A': {
                            stationCards: [
                                { card: createCard({ id: 'C2A' }), place: 'action' },
                                { card: createCard({ id: 'C3A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                this.error = catchError(() => {
                    this.match.attackStationCard('P1A', { attackerCardId: 'C1A', targetStationCardIds: ['C2A'] });
                });
            },
            'should NOT throw an error'() {
                refute.defined(this.error);
            },
            'when restore first player state should NOT have missile card'() {
                this.match.start();
                const { cardsInOpponentZone } = this.firstPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(cardsInOpponentZone.length, 0);
            },
            'should flip attacked station card': function () {
                this.match.start();
                let { stationCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(stationCards.length, 2);

                let flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 1);
                assert.match(flippedCards[0].card, { id: 'C2A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
            },
            'should emit flipped station card to second player': function () {
                const { stationCards } = this.secondPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(stationCards.length, 2);

                let flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 1);
                assert.match(flippedCards[0].card, { id: 'C2A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
            },
            'should emit flipped station card to first player': function () {
                const { opponentStationCards } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(opponentStationCards.length, 2);

                let flippedCards = opponentStationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 1);
                assert.match(flippedCards[0].card, { id: 'C2A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
            }
        }
    },
    'station cards:': {
        'when attack station with a card with 2 in attack': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
                this.match = createMatch({
                    players: [
                        Player('P1A', this.firstPlayerConnection),
                        Player('P2A', this.secondPlayerConnection),
                    ]
                });
                this.match.restoreFromState(createState({
                    turn: 3,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A', attack: 2 })],
                            events: [{ type: 'moveCard', turn: 1, cardId: 'C1A' }]
                        },
                        'P2A': {
                            stationCards: [
                                { card: createCard({ id: 'C2A' }), place: 'action' },
                                { card: createCard({ id: 'C3A' }), place: 'action' },
                                { card: createCard({ id: 'C4A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                this.match.attackStationCard('P1A', {
                    attackerCardId: 'C1A',
                    targetStationCardIds: ['C2A', 'C3A']
                });
            },
            'when second player restore state should have 1 station card flipped': function () {
                this.match.start();
                let { stationCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(stationCards.length, 3);

                let flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 2);
                assert.match(flippedCards[0].card, { id: 'C2A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
                assert.match(flippedCards[1].card, { id: 'C3A' });
                assert.match(flippedCards[1], { flipped: true, place: 'action' });
            },
            'when first player restore state 1 of the opponent station cards should be flipped': function () {
                this.match.start();
                let { opponentStationCards } = this.firstPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(opponentStationCards.length, 3);

                let flippedCards = opponentStationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 2);
                assert.match(flippedCards[0].card, { id: 'C2A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
                assert.match(flippedCards[1].card, { id: 'C3A' });
                assert.match(flippedCards[1], { flipped: true, place: 'action' });
            },
            'should emit flipped station card to second player': function () {
                const { stationCards } = this.secondPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(stationCards.length, 3);

                let flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 2);
                assert.match(flippedCards[0].card, { id: 'C2A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
                assert.match(flippedCards[1].card, { id: 'C3A' });
                assert.match(flippedCards[1], { flipped: true, place: 'action' });
            },
            'should emit flipped station card to first player': function () {
                const { opponentStationCards } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(opponentStationCards.length, 3);

                let flippedCards = opponentStationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 2);
                assert.match(flippedCards[0].card, { id: 'C2A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
                assert.match(flippedCards[1].card, { id: 'C3A' });
                assert.match(flippedCards[1], { flipped: true, place: 'action' });
            }
        },
        'when card has NOT been in enemy zone for 1 turn': {
            setUp() {
                this.match = createMatch({ players: [Player('P1A'), Player('P2A')] });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A' })],
                            events: [{ type: 'moveCard', cardId: 'C1A', turn: 2 }]
                        },
                        'P2A': {
                            stationCards: [
                                { card: createCard({ id: 'C2A' }), place: 'action' },
                                { card: createCard({ id: 'C3A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', targetStationCardIds: ['C2A'] }
                this.error = catchError(() => this.match.attackStationCard('P1A', attackOptions));
            },
            'should throw error'() {
                assert(this.error);
                assert.equals(this.error.message, 'Cannot attack station');
            }
        },
        'when card has never been moved': {
            setUp() {
                this.match = createMatch({
                    players: [
                        Player('P1A'),
                        Player('P2A'),
                    ]
                });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInZone: [createCard({ id: 'C1A' })],
                            events: []
                        },
                        'P2A': {
                            stationCards: [
                                { card: createCard({ id: 'C2A' }), place: 'action' },
                                { card: createCard({ id: 'C3A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', targetStationCardIds: ['C2A'] }
                this.error = catchError(() => this.match.attackStationCard('P1A', attackOptions));
            },
            'should throw error'() {
                assert(this.error);
                assert.equals(this.error.message, 'Can only attack station card from enemy zone');
            }
        },
        'when attack station card twice': {
            setUp() {
                this.match = createMatch({ players: [Player('P1A'), Player('P2A')] });
                this.match.restoreFromState(createState({
                    turn: 3,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A' })],
                            events: [{ type: 'moveCard', turn: 1, cardId: 'C1A' }]
                        },
                        'P2A': {
                            stationCards: [
                                { card: createCard({ id: 'C2A' }), place: 'action' },
                                { card: createCard({ id: 'C3A' }), place: 'action' },
                                { card: createCard({ id: 'C4A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                this.match.attackStationCard('P1A', { attackerCardId: 'C1A', targetStationCardIds: ['C2A'] });
                const attackOptions = { attackerCardId: 'C1A', targetStationCardIds: ['C3A'] };
                this.error = catchError(() => this.match.attackStationCard('P1A', attackOptions));
            },
            'should throw error'() {
                assert(this.error);
                assert.equals(this.error.message, 'Cannot attack station');
            }
        },
        'when attack 2 station cards with 2 different cards': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
                this.match = createMatch({
                    players: [
                        Player('P1A', this.firstPlayerConnection),
                        Player('P2A', this.secondPlayerConnection),
                    ]
                });
                this.match.restoreFromState(createState({
                    turn: 3,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A' }), createCard({ id: 'C2A' })],
                            events: [
                                { type: 'moveCard', turn: 1, cardId: 'C1A' },
                                { type: 'moveCard', turn: 1, cardId: 'C2A' }
                            ]
                        },
                        'P2A': {
                            stationCards: [
                                { card: createCard({ id: 'C3A' }), place: 'action' },
                                { card: createCard({ id: 'C4A' }), place: 'handSize' },
                                { card: createCard({ id: 'C5A' }), place: 'draw' },
                            ]
                        }
                    }
                }));

                this.match.attackStationCard('P1A', { attackerCardId: 'C1A', targetStationCardIds: ['C3A'] });
                this.match.attackStationCard('P1A', { attackerCardId: 'C2A', targetStationCardIds: ['C5A'] });
            },
            'when second player restore state should have 2 station cards flipped': function () {
                this.match.start();
                let { stationCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(stationCards.length, 3);

                let flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 2);
                assert.match(flippedCards[0].card, { id: 'C3A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
                assert.match(flippedCards[1].card, { id: 'C5A' });
                assert.match(flippedCards[1], { flipped: true, place: 'draw' });
            },
            'when first player restore state 2 of the opponent station cards should be flipped': function () {
                this.match.start();
                let { opponentStationCards } = this.firstPlayerConnection.restoreState.lastCall.args[0];
                assert.equals(opponentStationCards.length, 3);

                let flippedCards = opponentStationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 2);
                assert.match(flippedCards[0].card, { id: 'C3A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
                assert.match(flippedCards[1].card, { id: 'C5A' });
                assert.match(flippedCards[1], { flipped: true, place: 'draw' });
            },
            'should emit flipped station card to second player': function () {
                const { stationCards } = this.secondPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(stationCards.length, 3);

                let flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 2);
                assert.match(flippedCards[0].card, { id: 'C3A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
                assert.match(flippedCards[1].card, { id: 'C5A' });
                assert.match(flippedCards[1], { flipped: true, place: 'draw' });
            },
            'should emit flipped station card to first player': function () {
                const { opponentStationCards } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
                assert.equals(opponentStationCards.length, 3);

                let flippedCards = opponentStationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 2);
                assert.match(flippedCards[0].card, { id: 'C3A' });
                assert.match(flippedCards[0], { flipped: true, place: 'action' });
                assert.match(flippedCards[1].card, { id: 'C5A' });
                assert.match(flippedCards[1], { flipped: true, place: 'draw' });
            }
        },
        'when attacking station card that does NOT exist': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState', 'opponentStationCardsChanged']);
                this.secondPlayerConnection = FakeConnection2(['restoreState', 'stationCardsChanged']);
                this.match = createMatch({
                    players: [
                        Player('P1A', this.firstPlayerConnection),
                        Player('P2A', this.secondPlayerConnection),
                    ]
                });
                this.match.restoreFromState(createState({
                    turn: 3,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A', type: 'action' })],
                            events: [{ type: 'moveCard', cardId: 'C1A', turn: 1 }]
                        },
                        'P2A': {
                            stationCards: [
                                { card: createCard({ id: 'C2A' }), place: 'action' },
                                { card: createCard({ id: 'C3A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', targetStationCardIds: ['NO_CARD_HAS_THIS_ID'] }
                this.error = catchError(() => this.match.attackStationCard('P1A', attackOptions));
            },
            'should NOT throw error'() {
                refute(this.error);
            },
            'when second player restore state should NOT have any station cards flipped'() {
                this.match.start();
                let { stationCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
                let flippedCards = stationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 0);
            },
            'when first player restore state none of the opponent station cards should be flipped'() {
                this.match.start();
                let { opponentStationCards } = this.firstPlayerConnection.restoreState.lastCall.args[0];
                let flippedCards = opponentStationCards.filter(s => s.flipped);
                assert.equals(flippedCards.length, 0);
            },
            'should NOT emit flipped station card to second player'() {
                refute.called(this.secondPlayerConnection.stationCardsChanged);
            },
            'should NOT emit flipped station card to first player'() {
                refute.called(this.firstPlayerConnection.opponentStationCardsChanged);
            }
        },
        'when attacking station card that is flipped': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['opponentStationCardsChanged']);
                this.secondPlayerConnection = FakeConnection2(['stationCardsChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    turn: 3,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A', type: 'defense' })],
                            events: [{ type: 'moveCard', cardId: 'C1A', turn: 1 }]
                        },
                        'P2A': {
                            stationCards: [
                                { card: createCard({ id: 'C2A' }), place: 'action' },
                                { card: createCard({ id: 'C3A' }), place: 'action', flipped: true }
                            ]
                        }
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', targetStationCardIds: ['C3A'] }
                this.error = catchError(() => this.match.attackStationCard('P1A', attackOptions));
            },
            'should throw error'() {
                assert(this.error);
                assert.equals(this.error.message, 'Cannot attack a flipped station card');
            },
            'should NOT emit flipped station card to second player'() {
                refute.called(this.secondPlayerConnection.stationCardsChanged);
            },
            'should NOT emit flipped station card to first player'() {
                refute.called(this.firstPlayerConnection.opponentStationCardsChanged);
            }
        },
        'when enemy has 2 station cards and attacker has 2 in attack but only gives 1 target station card id': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['opponentStationCardsChanged']);
                this.secondPlayerConnection = FakeConnection2(['stationCardsChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    turn: 3,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A', attack: 2 })],
                            events: [{ type: 'moveCard', cardId: 'C1A', turn: 1 }]
                        },
                        'P2A': {
                            stationCards: [
                                { card: createCard({ id: 'C2A' }), place: 'action' },
                                { card: createCard({ id: 'C3A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', targetStationCardIds: ['C3A'] }
                this.error = catchError(() => this.match.attackStationCard('P1A', attackOptions));
            },
            'should throw error'() {
                assert(this.error);
                assert.equals(this.error.message, 'Need more target station cards to attack');
            }
        },
        'when enemy has 1 unflipped station card left and attacker has 2 in attack but only gives 1 target station card id': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['opponentStationCardsChanged']);
                this.secondPlayerConnection = FakeConnection2(['stationCardsChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    turn: 3,
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A', attack: 2 })],
                            events: [{ type: 'moveCard', cardId: 'C1A', turn: 1 }]
                        },
                        'P2A': {
                            stationCards: [
                                { card: createCard({ id: 'C2A' }), place: 'action' },
                                { card: createCard({ id: 'C3A' }), flipped: true, place: 'action' },
                            ]
                        }
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', targetStationCardIds: ['C2A'] }
                this.error = catchError(() => this.match.attackStationCard('P1A', attackOptions));
            },
            'should NOT throw error'() {
                refute(this.error);
            }
        },
        'when enemy has only 1 station card and attacker has 2 in attack but only gives 1 target station card id': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['opponentStationCardsChanged']);
                this.secondPlayerConnection = FakeConnection2(['stationCardsChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    turn: 3,
                    currentPlayer: 'P1A',
                    playerOrder: ['P1A', 'P2A'],
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A', attack: 2 })],
                            events: [MoveCardEvent({ turn: 1, cardId: 'C1A' })]
                        },
                        'P2A': {
                            stationCards: [
                                { card: createCard({ id: 'C3A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                const attackOptions = { attackerCardId: 'C1A', targetStationCardIds: ['C3A'] }
                this.error = catchError(() => this.match.attackStationCard('P1A', attackOptions));
            },
            'should NOT throw error'() {
                refute(this.error);
            }
        }
    },
    'move:': { //TODO Move all "move" tests here
        'when card can move and move from opponent zone to home zone': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState']);
                this.secondPlayerConnection = FakeConnection2(['opponentMovedCard']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    turn: 3,
                    playerStateById: {
                        'P1A': {
                            phase: 'attack',
                            cardsInOpponentZone: [createCard({ id: 'C1A' })],
                            events: [
                                PutDownCardEvent({ turn: 1, cardId: 'C1A' }),
                                MoveCardEvent({ turn: 2, cardId: 'C1A' })
                            ]
                        }
                    }
                }));

                this.match.moveCard('P1A', 'C1A');
            },
            'should emit "opponentMovedCard"'() {
                assert.calledOnce(this.secondPlayerConnection.opponentMovedCard);
                assert.calledWith(this.secondPlayerConnection.opponentMovedCard, 'C1A');
            },
            'when restore state first player should have card in home zone'() {
                this.match.start();
                const { cardsInZone, cardsInOpponentZone } = this.firstPlayerConnection.restoreState.lastCall.args[0];

                assert.equals(cardsInZone.length, 1);
                assert.match(cardsInZone[0], { id: 'C1A' });

                assert.equals(cardsInOpponentZone.length, 0);
            }
        }
    }
};
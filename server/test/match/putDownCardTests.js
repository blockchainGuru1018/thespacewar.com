const {
    bocha: {
        stub,
        assert,
        refute,
        sinon
    },
    FakeDeckFactory,
    createCard,
    createPlayers,
    Player,
    createPlayer,
    createMatchAndGoToFirstActionPhase,
    createMatch,
    FakeConnection,
    FakeConnection2,
    catchError,
    createState,
    FakeDeck
} = require('./shared.js');
const PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');
const GrandOpportunityCommonId = '20';
const ExcellentWorkCommonId = '14';
const SupernovaCommonId = '15';
const DiscoveryCommonId = '42';
const FatalErrorCommonId = '38';
const ExpansionCommonId = '40';

module.exports = {
    'when does NOT have card should throw error': function () {
        let match = createMatch({
            players: createPlayers([{ id: 'P1A' }])
        });
        match.start();
        match.start();
        const putDownCardOptions = { location: 'zone', cardId: 'C1A' };

        let error = catchError(() => match.putDownCard('P1A', putDownCardOptions));

        assert.equals(error.message, 'Cannot find card');
    },
    'when does NOT have enough action points to place card in zone': function () {
        this.match = createMatch({ players: [Player('P1A')] });
        this.match.restoreFromState(createState({
            turn: 2,
            currentPlayer: 'P1A',
            playerOrder: ['P1A', 'P2A'],
            playerStateById: {
                'P1A': {
                    phase: 'action',
                    cardsOnHand: [createCard({ id: 'C1A', cost: 7 })]
                }
            }
        }));

        const putDownCardOptions = { location: 'zone', cardId: 'C1A' };
        let error = catchError(() => this.match.putDownCard('P1A', putDownCardOptions));

        assert.equals(error.message, 'Cannot afford card');
        assert.equals(error.type, 'CheatDetected');
    },
    'when have just started game': {
        async setUp() {
            const restoreState = stub();
            const connection = FakeConnection({ restoreState });
            const player = createPlayer({ id: 'P1A', cost: 1, connection });
            let match = createMatch({ players: [player] });
            match.start();
            match.start();

            match.start();
            this.state = restoreState.firstCall.args[0];
        },
        'should have 7 cards on hand': function () {
            assert.equals(this.state.cardsOnHand.length, 7);
        },
        'should have correct amount and position of station cards': function () {
            assert.equals(this.state.stationCards.length, 5);
            assert.equals(this.state.stationCards.filter(c => c.place === 'draw').length, 1);
            assert.equals(this.state.stationCards.filter(c => c.place === 'action').length, 3);
            assert.equals(this.state.stationCards.filter(c => c.place === 'handSize').length, 1);
        },
        'should have 6 action points equal to the amound of station cards * 2': function () {
            assert.equals(this.state.actionPoints, 6);
        },
        'should be first players turn': function () {
            assert.equals(this.state.currentPlayer, 'P1A');
        },
        'should be turn 1': function () {
            assert.equals(this.state.turn, 1);
        }
    },
    'when can afford card:': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.secondPlayerConnection = FakeConnection2(['putDownOpponentCard', 'restoreState']);
            this.match = createMatch({
                players: [
                    createPlayer({ id: 'P1A', connection: this.firstPlayerConnection }),
                    createPlayer({ id: 'P2A', connection: this.secondPlayerConnection })
                ]
            });
            this.match.restoreFromState(createState({
                turn: 1,
                currentPlayer: 'P1A',
                playerOrder: ['P1A', 'P2A'],
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C1A', cost: 1 })],
                        stationCards: [{ card: createCard({ id: 'C2A' }), place: 'action' }]
                    }
                }
            }));

            this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
        },
        'should put card in zone'() {
            this.match.start();
            let state = this.firstPlayerConnection.restoreState.firstCall.args[0];
            assert.equals(state.cardsInZone.length, 1);
            assert.equals(state.cardsInZone[0].id, 'C1A');
        },
        'should remove card from hand'() {
            this.match.start();
            let state = this.firstPlayerConnection.restoreState.firstCall.args[0];
            assert.equals(state.cardsOnHand.length, 0);
        },
        'should add event'() {
            this.match.start();
            let state = this.firstPlayerConnection.restoreState.firstCall.args[0];
            assert.equals(state.events.length, 1);
            assert.match(state.events[0], {
                type: 'putDownCard',
                turn: 1,
                location: 'zone',
                cardId: 'C1A'
            });
        },
        'should emit zone card to other player'() {
            let event = this.secondPlayerConnection.putDownOpponentCard.lastCall.args[0];
            assert.equals(event.location, 'zone');
            assert.match(event.card, { id: 'C1A' });
        },
        'when second player restore state should get zone card'() {
            this.match.start();
            const { opponentCardsInZone } = this.secondPlayerConnection.restoreState.lastCall.args[0];
            assert(opponentCardsInZone);
            assert.equals(opponentCardsInZone.length, 1);
            assert.match(opponentCardsInZone[0], { id: 'C1A' });
        }
    },
    'when put down station card and has already put down a station this turn should throw error': function () {
        let match = createMatchAndGoToFirstActionPhase({
            deckFactory: FakeDeckFactory.fromCards([
                createCard({ id: 'C1A' }),
                createCard({ id: 'C2A' })
            ]),
            players: [createPlayer({ id: 'P1A' })]
        });
        match.putDownCard('P1A', { location: 'station-draw', cardId: 'C1A' });

        let error = catchError(() => match.putDownCard('P1A', { location: 'station-draw', cardId: 'C2A' }));

        assert.equals(error.message, 'Cannot put down more station cards this turn');
        assert.equals(error.type, 'CheatDetected');
    },
    'when put down card and is NOT your turn should throw error': function () {
        let match = createMatchAndGoToFirstActionPhase({
            deckFactory: FakeDeckFactory.fromCards([
                createCard({ id: 'C1A' }),
                createCard({ id: 'C2A' })
            ]),
            players: [createPlayer({ id: 'P1A' })]
        });

        let error = catchError(() => match.putDownCard('P2A', { location: 'zone', cardId: 'C2A' }));

        assert.equals(error.message, 'Cannot put down card when it is not your turn');
        assert.equals(error.type, 'CheatDetected');
    },
    'when has 1 flipped action station card and put down that station card': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.secondPlayerConnection = FakeConnection2(['restoreState', 'putDownOpponentCard']);
            this.match = createMatch({
                players: [
                    Player('P1A', this.firstPlayerConnection),
                    Player('P2A', this.secondPlayerConnection),
                ]
            });
            this.match.restoreFromState(createState({
                currentPlayer: 'P1A',
                playerOrder: ['P1A', 'P2A'],
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsInZone: [],
                        stationCards: [
                            { card: createCard({ id: 'C1A' }), place: 'action' },
                            { flipped: true, card: createCard({ id: 'C2A' }), place: 'action' },
                        ]
                    },
                    'P2A': {}
                }
            }));

            this.match.putDownCard('P1A', { location: 'zone', cardId: 'C2A' });
        },
        'when restore state should have card on hand and not among station cards'() {
            this.match.start();
            const { stationCards, cardsInZone } = this.firstPlayerConnection.restoreState.lastCall.args[0];

            assert.equals(stationCards.length, 1);
            assert.equals(stationCards[0].id, 'C1A');

            assert.equals(cardsInZone.length, 1);
            assert.equals(cardsInZone[0].id, 'C2A');
        },
        'when second player restore state the opponent should have 1 more card in play and 1 less action station card'() {
            this.match.start();
            const { opponentCardsInZone, opponentStationCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(opponentCardsInZone.length, 1);
            assert.equals(opponentCardsInZone[0].id, 'C2A');

            assert.equals(opponentStationCards.length, 1);
            assert.equals(opponentStationCards[0].id, 'C1A');
        },
        'should emit put down opponent card'() {
            const { location, card } = this.secondPlayerConnection.putDownOpponentCard.lastCall.args[0];
            assert.equals(location, 'zone');
            assert.equals(card.id, 'C2A');
        }
    },
    'when try to move flipped station card to zone but cannot afford card should throw'() {
        this.match = createMatch({ players: [Player('P1A'), Player('P2A')] });
        this.match.restoreFromState(createState({
            currentPlayer: 'P1A',
            playerOrder: ['P1A', 'P2A'],
            playerStateById: {
                'P1A': {
                    phase: 'action',
                    cardsInZone: [],
                    stationCards: [
                        { card: createCard({ id: 'C1A' }), place: 'action' },
                        { flipped: true, card: createCard({ id: 'C2A', cost: 5 }), place: 'action' },
                    ]
                }
            }
        }));

        let error = catchError(() => this.match.putDownCard('P1A', { location: 'zone', cardId: 'C2A' }));

        assert(error);
        assert.equals(error.message, 'Cannot afford card');
    },
    'when try to move station card that is NOT flipped to zone should throw'() {
        this.match = createMatch({ players: [Player('P1A'), Player('P2A')] });
        this.match.restoreFromState(createState({
            currentPlayer: 'P1A',
            playerOrder: ['P1A', 'P2A'],
            playerStateById: {
                'P1A': {
                    phase: 'action',
                    cardsInZone: [],
                    stationCards: [
                        { card: createCard({ id: 'C1A' }), place: 'action' },
                        { flipped: false, card: createCard({ id: 'C2A' }), place: 'action' },
                    ]
                }
            }
        }));

        let error = catchError(() => this.match.putDownCard('P1A', { location: 'zone', cardId: 'C2A' }));

        assert(error);
        assert.equals(error.message, 'Cannot move station card that is not flipped to zone');
    },
    'when has 1 flipped event station card and put down that station card': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.secondPlayerConnection = FakeConnection2(['restoreState', 'stateChanged']);
            this.match = createMatch({
                players: [
                    Player('P1A', this.firstPlayerConnection),
                    Player('P2A', this.secondPlayerConnection),
                ]
            });
            this.match.restoreFromState(createState({
                currentPlayer: 'P1A',
                playerOrder: ['P1A', 'P2A'],
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsInZone: [],
                        stationCards: [
                            { card: createCard({ id: 'C1A' }), place: 'action' },
                            { flipped: true, card: createCard({ id: 'C2A', type: 'event' }), place: 'action' },
                        ]
                    }
                }
            }));

            this.match.putDownCard('P1A', { location: 'zone', cardId: 'C2A' });
        },
        'first player should NOT have card among station cards'() {
            this.match.start();
            const { stationCards } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(stationCards.length, 1);
            assert.equals(stationCards[0].id, 'C1A');
        },
        'first player should NOT have card in zone'() {
            this.match.start();
            const { cardsInZone } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(cardsInZone.length, 0);
        },
        'first player should have card in discard pile'() {
            this.match.start();
            const { discardedCards } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(discardedCards.length, 1);
            assert.equals(discardedCards[0].id, 'C2A');
        },
        'when second player restore state the opponent should have 0 cards in play and 1 less action station card and 1 more card in discarded pile'() {
            this.match.start();
            const { opponentDiscardedCards, opponentCardsInZone, opponentStationCards } = this.secondPlayerConnection.restoreState.lastCall.args[0];

            assert.equals(opponentDiscardedCards.length, 1);
            assert.equals(opponentDiscardedCards[0].id, 'C2A');

            assert.equals(opponentCardsInZone.length, 0);
            assert.equals(opponentStationCards.length, 1);
            assert.equals(opponentStationCards[0].id, 'C1A');
        },
        'should emit state changed to second player'() {
            assert.calledOnce(this.secondPlayerConnection.stateChanged);
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                opponentDiscardedCards: [sinon.match({ id: 'C2A' })]
            }));
        },
        'should NOT emit state changed with opponentCardCount to second player'() {
            refute.defined(this.secondPlayerConnection.stateChanged.lastCall.args[0].opponentCardCount);
        },
        'should NOT emit state changed with opponentCardsInZone to second player'() {
            refute.defined(this.secondPlayerConnection.stateChanged.lastCall.args[0].opponentCardsInZone);
        }
    },
    'when put down event card from hand to own zone': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [
                Player('P1A', this.firstPlayerConnection),
                Player('P2A', this.secondPlayerConnection)
            ]
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [
                            createCard({ id: 'C1A', type: 'event' })
                        ]
                    }
                }
            }));

            this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
        },
        'first player should have card in discard pile'() {
            this.match.start();
            const { discardedCards } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(discardedCards.length, 1);
            assert.match(discardedCards[0], { id: 'C1A' });
        },
        'first player should NOT have card in zone'() {
            this.match.start();
            const { cardsInZone } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(cardsInZone.length, 0);
        },
        'first player should NOT have card on hand'() {
            this.match.start();
            const { cardsOnHand } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(cardsOnHand.length, 0);
        },
        'should emit state changed with opponent discarded cards and card count to second player'() {
            assert.calledOnce(this.secondPlayerConnection.stateChanged);
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                opponentCardCount: 0,
                opponentDiscardedCards: [sinon.match({ id: 'C1A' })]
            }));
        }
    },
    'Supernova:': {
        'when first player put down Supernova': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [
                    Player('P1A', this.firstPlayerConnection),
                    Player('P2A', this.secondPlayerConnection)
                ]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsInZone: [createCard({ id: 'C1A' })],
                            cardsInOpponentZone: [createCard({ id: 'C2A' })],
                            cardsOnHand: [
                                createCard({ id: 'C3A', type: 'event', commonId: SupernovaCommonId }),
                                createCard({ id: 'A' }),
                                createCard({ id: 'B' }),
                                createCard({ id: 'C' })
                            ],
                            stationCards: [
                                { card: createCard({ id: 'S1A' }), place: 'action' },
                                { card: createCard({ id: 'S2A' }), place: 'action' },
                                { card: createCard({ id: 'S3A' }), place: 'action' }
                            ]
                        },
                        'P2A': {
                            phase: 'wait',
                            cardsInZone: [createCard({ id: 'C4A' })],
                            cardsInOpponentZone: [createCard({ id: 'C5A' })],
                            cardsOnHand: [
                                createCard({ id: 'D' }),
                                createCard({ id: 'E' }),
                                createCard({ id: 'F' })
                            ],
                            stationCards: [
                                { card: createCard({ id: 'S4A' }), place: 'action' },
                                { card: createCard({ id: 'S5A' }), place: 'action' },
                                { card: createCard({ id: 'S6A' }), place: 'action' }
                            ]
                        }
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C3A' });
            },
            'should emit stateChanged to first player'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    cardsInZone: [],
                    cardsInOpponentZone: [],
                    opponentCardsInZone: [],
                    opponentCardsInPlayerZone: [],
                    discardedCards: [
                        sinon.match({ id: 'C1A' }),
                        sinon.match({ id: 'C2A' }),
                        sinon.match({ id: 'C3A' })
                    ],
                    opponentDiscardedCards: [
                        sinon.match({ id: 'C4A' }),
                        sinon.match({ id: 'C5A' })
                    ],
                    requirements: [
                        sinon.match({ type: 'discardCard', common: true, count: 3 }),
                        sinon.match({ type: 'damageStationCard', common: true, count: 3 })
                    ],
                    events: [
                        sinon.match({ type: 'discardCard', cardId: 'C1A' }),
                        sinon.match({ type: 'discardCard', cardId: 'C2A' }),
                        sinon.match({ type: 'putDownCard', cardId: 'C3A' }),
                        sinon.match({ type: 'discardCard', cardId: 'C3A' }),
                    ]
                }));
            },
            'should emit stateChanged to second player'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
                assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                    cardsInZone: [],
                    cardsInOpponentZone: [],
                    opponentCardsInZone: [],
                    opponentCardsInPlayerZone: [],
                    discardedCards: [
                        sinon.match({ id: 'C4A' }),
                        sinon.match({ id: 'C5A' })
                    ],
                    opponentDiscardedCards: [
                        sinon.match({ id: 'C1A' }),
                        sinon.match({ id: 'C2A' }),
                        sinon.match({ id: 'C3A' })
                    ],
                    opponentCardCount: 3,
                    events: [
                        sinon.match({ type: 'discardCard', cardId: 'C4A' }),
                        sinon.match({ type: 'discardCard', cardId: 'C5A' })
                    ],
                    requirements: [
                        sinon.match({ type: 'discardCard', common: true, count: 3 }),
                        sinon.match({ type: 'damageStationCard', common: true, count: 3 })
                    ]
                }));
            }
        },
        'when first player put down Supernova and both players has NO station cards and NO cards on hand': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)];
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [createCard({ id: 'C3A', type: 'event', commonId: SupernovaCommonId })],
                        }
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C3A' });
            },
            'should NOT include requirements in state changed event to first player'() {
                refute.defined(this.firstPlayerConnection.stateChanged.lastCall.args[0].requirements);
            },
            'should NOT include requirements in state changed event to second player'() {
                refute.defined(this.secondPlayerConnection.stateChanged.lastCall.args[0].requirements);
            }
        },
        'when first player put down Supernova and first player has NO cards on hand': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)];
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [createCard({ id: 'C1A', type: 'event', commonId: SupernovaCommonId })],
                            stationCards: [{ id: 'S1A', place: 'draw', card: createCard({ id: 'S1A' }) }]
                        },
                        'P2A': {
                            cardsOnHand: [createCard({ id: 'C2A' })],
                            stationCards: [{ id: 'S2A', place: 'draw', card: createCard({ id: 'S2A' }) }]
                        }
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
            },
            'first player: should ONLY include damageStationCard requirement'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    requirements: [
                        sinon.match({ type: 'damageStationCard', common: true, count: 1 })
                    ]
                }));
            },
            'second player: discardCard requirement should NOT be common'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
                const discardCardRequirement = this.secondPlayerConnection.stateChanged.lastCall.args[0].requirements.find(
                    r => r.type === 'discardCard');
                refute('common' in discardCardRequirement, 'discardCard requirement should NOT be common');
            }
        },
        'when first player put down Supernova and both players has 1 flipped station card and 1 unflipped station card': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)];
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [createCard({ id: 'C1A', type: 'event', commonId: SupernovaCommonId })],
                            stationCards: [
                                { card: createCard({ id: 'C2A' }), place: 'draw' },
                                { flipped: true, card: createCard({ id: 'C3A' }), place: 'draw' }
                            ]
                        },
                        'P2A': {
                            stationCards: [
                                { card: createCard({ id: 'C4A' }), place: 'draw' },
                                { flipped: true, card: createCard({ id: 'C5A' }), place: 'draw' }
                            ]
                        }
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
            },
            'should send damage own station card requirement of 1 count to first player'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    requirements: [sinon.match({ type: 'damageStationCard', common: true, count: 1 })]
                }));
            },
            'should send damage own station card requirement of 1 count to second player'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
                const requirements = this.secondPlayerConnection.stateChanged.lastCall.args[0].requirements
                assert.equals(requirements.length, 1);
                assert.match(requirements[0], { type: 'damageStationCard', common: true, count: 1 });
            }
        }
    },
    'Excellent work': {
        'when first player put down Excellent work': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [createCard({ id: 'C1A', type: 'event', commonId: ExcellentWorkCommonId })],
                        }
                    },
                    deckByPlayerId: {
                        'P1A': FakeDeck.realDeckFromCards([
                            createCard({ id: 'C2A' }),
                            createCard({ id: 'C3A' }),
                            createCard({ id: 'C4A' })
                        ])
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
            },
            'should emit stateChanged to first player'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    discardedCards: [sinon.match({ id: 'C1A' })],
                    requirements: [sinon.match({ type: 'drawCard', count: 3 })],
                    events: [
                        sinon.match({ type: 'putDownCard', cardId: 'C1A' }),
                        sinon.match({ type: 'discardCard', cardId: 'C1A' })
                    ]
                }));
            },
            'should emit stateChanged to second player'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
                assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                    opponentDiscardedCards: [sinon.match({ id: 'C1A' })],
                    opponentCardCount: 0
                }));
            }
        },
        'when first player put down Excellent work but only has 1 card left in deck': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [createCard({ id: 'C1A', type: 'event', commonId: ExcellentWorkCommonId })],
                        }
                    },
                    deckByPlayerId: {
                        'P1A': FakeDeck.realDeckFromCards([createCard({ id: 'C2A' })])
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
            },
            'should emit stateChanged to first player with requirement count of 1'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    requirements: [sinon.match({ type: 'drawCard', count: 1 })],
                }));
            }
        },
        'when first player put down Excellent work but has NO card left in deck': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [createCard({ id: 'C1A', type: 'event', commonId: ExcellentWorkCommonId })],
                        }
                    },
                    deckByPlayerId: {
                        'P1A': FakeDeck.realDeckFromCards([])
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
            },
            'should NOT emit state changed with any requirements'() {
                refute.defined(this.firstPlayerConnection.stateChanged.lastCall.args[0].requirements);
            }
        },
        'when has already put down station card this turn and put down Excellent work': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['restoreState']);
                const players = [Player('P1A', this.firstPlayerConnection)];
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            turn: 1,
                            phase: 'action',
                            cardsOnHand: [
                                createCard({ id: 'C2A', commonId: ExcellentWorkCommonId })
                            ],
                            stationCards: [
                                { place: 'draw', id: 'C1A', card: createCard({ id: 'C1A' }) },
                            ],
                            events: [
                                PutDownCardEvent({ turn: 1, location: 'station-draw', cardId: 'C1A' })
                            ]
                        },
                    }
                }));

                const options = { location: 'station-draw', cardId: 'C2A' };
                this.error = catchError(() => this.match.putDownCard('P1A', options));
            },
            'should NOT throw'() {
                refute(this.error);
            },
            'should have added excellent work as station card'() {
                this.match.refresh('P1A');
                assert.calledWith(this.firstPlayerConnection.restoreState, sinon.match({
                    stationCards: [
                        sinon.match({ id: 'C1A', place: 'draw' }),
                        sinon.match({ id: 'C2A', place: 'draw' })
                    ]
                }));
            }
        }
    },
    'Grand Opportunity': {
        'when first player put down Grand Opportunity': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [
                                createCard({ id: 'C1A', type: 'event', commonId: GrandOpportunityCommonId }),
                                createCard({ id: 'C2A', type: 'event', commonId: GrandOpportunityCommonId }),
                                createCard({ id: 'C3A', type: 'event', commonId: GrandOpportunityCommonId })
                            ],
                        }
                    },
                    deckByPlayerId: {
                        'P1A': FakeDeck.realDeckFromCards([
                            createCard({ id: 'C4A' }),
                            createCard({ id: 'C5A' }),
                            createCard({ id: 'C6A' }),
                            createCard({ id: 'C7A' }),
                            createCard({ id: 'C8A' }),
                            createCard({ id: 'C9A' }),
                        ])
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
            },
            'should emit stateChanged to first player'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    discardedCards: [sinon.match({ id: 'C1A' })],
                    requirements: [
                        sinon.match({ type: 'drawCard', count: 6 }),
                        sinon.match({ type: 'discardCard', count: 2 })
                    ],
                    events: [
                        sinon.match({ type: 'putDownCard', cardId: 'C1A' }),
                        sinon.match({ type: 'discardCard', cardId: 'C1A' })
                    ]
                }));
            },
            'should emit stateChanged to second player'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
                assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                    opponentDiscardedCards: [sinon.match({ id: 'C1A' })],
                    opponentCardCount: 2
                }));
            }
        },
        'when first player put down Grand Opportunity but only has 1 card left in deck and 1 more on hand': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [
                                createCard({ id: 'C1A', type: 'event', commonId: GrandOpportunityCommonId }),
                                createCard({ id: 'C2A' })
                            ],
                        }
                    },
                    deckByPlayerId: {
                        'P1A': FakeDeck.realDeckFromCards([createCard({ id: 'C3A' })])
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
            },
            'should emit stateChanged to first player with draw card of count of 1 and discard card of count 1'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    requirements: [
                        sinon.match({ type: 'drawCard', count: 1 }),
                        sinon.match({ type: 'discardCard', count: 1 })
                    ],
                }));
            }
        },
        'when first player put down Grand Opportunity but only has NO card left in deck and 1 more on hand': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [
                                createCard({ id: 'C1A', type: 'event', commonId: GrandOpportunityCommonId }),
                                createCard({ id: 'C2A' })
                            ],
                        }
                    },
                    deckByPlayerId: {
                        'P1A': FakeDeck.realDeckFromCards([])
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
            },
            'should emit stateChanged to first player with ONLY discard card'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    requirements: [sinon.match({ type: 'discardCard', count: 1 })],
                }));
            }
        },
        'when first player put down Grand Opportunity but only has 1 card left in deck and NO more on hand': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [createCard({ id: 'C1A', type: 'event', commonId: GrandOpportunityCommonId })]
                        }
                    },
                    deckByPlayerId: {
                        'P1A': FakeDeck.realDeckFromCards([createCard({ id: 'C2A' })])
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });
            },
            'should emit stateChanged to first player with ONLY draw card'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    requirements: [sinon.match({ type: 'drawCard', count: 1 })],
                }));
            }
        }
    },
    'Discovery:': {
        'when put down Discovery with choice "draw"': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [
                                createCard({ id: 'C1A', type: 'event', commonId: DiscoveryCommonId }),
                            ],
                        }
                    },
                    deckByPlayerId: {
                        'P1A': FakeDeck.realDeckFromCards([
                            createCard({ id: 'C4A' }),
                            createCard({ id: 'C5A' }),
                            createCard({ id: 'C6A' }),
                            createCard({ id: 'C6A' })
                        ]),
                        'P2A': FakeDeck.realDeckFromCards([
                            createCard({ id: 'C7A' }),
                            createCard({ id: 'C8A' }),
                            createCard({ id: 'C9A' }),
                            createCard({ id: 'C10A' })
                        ])
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A', choice: 'draw' });
            },
            'should emit stateChanged to first player'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    discardedCards: [sinon.match({ id: 'C1A' })],
                    requirements: [sinon.match({ type: 'drawCard', count: 4, common: true })],
                    events: [
                        sinon.match({ type: 'putDownCard', cardId: 'C1A' }),
                        sinon.match({ type: 'discardCard', cardId: 'C1A' })
                    ]
                }));
            },
            'should emit stateChanged to second player'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
                assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                    opponentDiscardedCards: [sinon.match({ id: 'C1A' })],
                    opponentCardCount: 0,
                    requirements: [sinon.match({ type: 'drawCard', count: 3, common: true })]
                }));
            }
        },
        'when put down Discovery with choice "discard"': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [
                                createCard({ id: 'C1A', type: 'event', commonId: DiscoveryCommonId }),
                                createCard({ id: 'C2A' }),
                                createCard({ id: 'C3A' })
                            ]
                        },
                        'P2A': {
                            cardsOnHand: [
                                createCard({ id: 'C4A' }),
                                createCard({ id: 'C5A' })
                            ]
                        }
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A', choice: 'discard' });
            },
            'should emit stateChanged to first player'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    requirements: [sinon.match({ type: 'discardCard', count: 1, common: true })],
                }));
            },
            'should emit stateChanged to second player'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
                assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                    requirements: [sinon.match({ type: 'discardCard', count: 2, common: true })]
                }));
            }
        }
    },
    'Fatal Error:': {
        'when put down Fatal Error': {
            setUp() {
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A'), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [createCard({ id: 'C1A', type: 'event', commonId: FatalErrorCommonId })]
                        },
                        'P2A': {
                            cardsInOpponentZone: [createCard({ id: 'C2A' })]
                        }
                    },
                    deckByPlayerId: {
                        'P2A': FakeDeck.realDeckFromCards([
                            createCard({ id: 'C3A' }),
                            createCard({ id: 'C4A' })
                        ])
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A', choice: 'C2A' });
            },
            'should emit draw card requirement to second player'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
                assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                    requirements: [sinon.match({ type: 'drawCard', count: 2 })]
                }));
            }
        },
        'when move Fatal Error from station card to zone': {
            setUp() {
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A'), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            stationCards: [
                                {
                                    place: 'action',
                                    card: createCard({ id: 'C1A', type: 'event', commonId: FatalErrorCommonId }),
                                    flipped: true
                                }
                            ]
                        },
                        'P2A': {
                            cardsInOpponentZone: [createCard({ id: 'C2A' })]
                        }
                    },
                    deckByPlayerId: {
                        'P2A': FakeDeck.realDeckFromCards([
                            createCard({ id: 'C3A' }),
                            createCard({ id: 'C4A' })
                        ])
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A', choice: 'C2A' });
            },
            'should emit draw card requirement to second player'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
                assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                    requirements: [sinon.match({ type: 'drawCard', count: 2 })]
                }));
            }
        },
        'when put down Fatal Error with choice matching opponent card': {
            setUp() {
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A'), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [createCard({ id: 'C1A', type: 'event', commonId: FatalErrorCommonId })]
                        },
                        'P2A': {
                            cardsInOpponentZone: [createCard({ id: 'C2A', defense: 1 })]
                        }
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A', choice: 'C2A' });
            },
            'should emit card moved to discard pile for second player'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
                assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                    cardsInOpponentZone: [],
                    discardedCards: [sinon.match({ id: 'C2A' })]
                }));
            }
        },
        'when put down Fatal Error with choice matching opponent station card': {
            setUp() {
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A'), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [createCard({ id: 'C1A', type: 'event', commonId: FatalErrorCommonId })]
                        },
                        'P2A': {
                            stationCards: [{ card: createCard({ id: 'C2A' }), place: 'draw' }]
                        }
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A', choice: 'C2A' });
            },
            'should emit card moved to discard pile for second player'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
                assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                    stationCards: [],
                    discardedCards: [sinon.match({ id: 'C2A' })]
                }));
            }
        },
        'when put down Fatal Error with choice matching player card': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A')]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [createCard({ id: 'C1A', type: 'event', commonId: FatalErrorCommonId })],
                            cardsInZone: [createCard({ id: 'C2A', defense: 1 })]
                        }
                    }
                }));

                this.match.putDownCard('P1A', { location: 'zone', cardId: 'C1A', choice: 'C2A' });
            },
            'should emit card moved to discard pile for first player'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    cardsInZone: [],
                    discardedCards: [
                        sinon.match({ id: 'C1A' }),
                        sinon.match({ id: 'C2A' })
                    ]
                }));
            }
        },
        'when put down Fatal Error with invalid card id as choice': {
            setUp() {
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A'), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            cardsOnHand: [createCard({ id: 'C1A', type: 'event', commonId: FatalErrorCommonId })]
                        },
                        'P2A': {
                            cardsInOpponentZone: [createCard({ id: 'C2A', defense: 1 })]
                        }
                    }
                }));

                const data = { location: 'zone', cardId: 'C1A', choice: null };
                this.error = catchError(() => this.match.putDownCard('P1A', data));
            },
            'should NOT throw error'() {
                refute(this.error);
            },
            'should emit card was NOT moved to discard pile for second player'() {
                assert.calledOnce(this.secondPlayerConnection.stateChanged);
                refute.defined(this.secondPlayerConnection.stateChanged.lastCall.args[0].discardedCards);
            }
        }
    },
    'Expansion:': {
        'when in the action phase and has put down second station card': {
            async setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['stateChanged']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            turn: 1,
                            phase: 'action',
                            cardsInZone: [createCard({ id: 'C2A', type: 'duration', commonId: ExpansionCommonId })],
                            stationCards: [
                                { place: 'draw', id: 'C1A', card: createCard({ id: 'C1A' }) }
                            ],
                            events: [
                                PutDownCardEvent({ turn: 1, location: 'station-draw', cardId: 'C1A' })
                            ]
                        },
                    },
                    deckByPlayerId: {
                        'P2A': FakeDeck.realDeckFromCards([
                            createCard({ id: 'C3A' }),
                            createCard({ id: 'C4A' })
                        ])
                    }
                }));

                const options = { location: 'station-draw', cardId: 'C2A' };
                this.error = catchError(() => this.match.putDownCard('P1A', options));
            },
            'should NOT throw'() {
                refute(this.error);
            },
            'should have put down second station card'() {
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    stationCards: [
                        sinon.match({ id: 'C1A', place: 'draw' }),
                        sinon.match({ id: 'C2A', place: 'draw' })
                    ]
                }));
            },
            'should have sent requirement to second player'() {
                assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                    requirements: [{ type: 'drawCard', count: 2 }]
                }));
            }
        },
        'when put down 2nd station card this turn and has 2 Expansion cards in play': {
            async setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['stateChanged', 'restoreState']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            turn: 1,
                            phase: 'action',
                            cardsOnHand: [
                                createCard({ id: 'C5A' })
                            ],
                            cardsInZone: [
                                createCard({ id: 'C3A', type: 'duration', commonId: ExpansionCommonId }),
                                createCard({ id: 'C4A', type: 'duration', commonId: ExpansionCommonId })
                            ],
                            stationCards: [
                                { place: 'draw', id: 'C1A', card: createCard({ id: 'C1A' }) }
                            ],
                            events: [
                                PutDownCardEvent({ turn: 1, location: 'station-draw', cardId: 'C1A' }),
                                { type: 'putDownExtraStationCard', effectCardId: 'C3A', turn: 1 }
                            ]
                        },
                        'P2A': {
                            requirements: [
                                { type: 'drawCard', count: 2 }
                            ]
                        }
                    },
                    deckByPlayerId: {
                        'P2A': FakeDeck.realDeckFromCards([
                            createCard(),
                            createCard(),
                            createCard(),
                            createCard(),
                        ])
                    }
                }));

                const options = { location: 'station-draw', cardId: 'C5A' };
                this.error = catchError(() => this.match.putDownCard('P1A', options));
            },
            'should NOT throw'() {
                refute(this.error);
            },
            'should add second putDownExtraStationCard event to player'() {
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    events: [
                        sinon.match({ turn: 1, location: 'station-draw', cardId: 'C1A' }),
                        { type: 'putDownExtraStationCard', effectCardId: 'C3A', turn: 1 },
                        sinon.match({ turn: 1, location: 'station-draw', cardId: 'C5A' }),
                        { type: 'putDownExtraStationCard', effectCardId: 'C4A', turn: 1 }
                    ]
                }));
            },
            'should add requirement to second player'() {
                this.match.start();
                assert.calledWith(this.secondPlayerConnection.restoreState, sinon.match({
                    requirements: [
                        sinon.match({ type: 'drawCard', count: 2 }),
                        sinon.match({ type: 'drawCard', count: 2 })
                    ]
                }));
            }
        },
        'when in the action phase and has put down 2 station cards and put down another': {
            async setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.secondPlayerConnection = FakeConnection2(['stateChanged', 'restoreState']);
                const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
                this.match = createMatch({ players });
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            turn: 1,
                            phase: 'action',
                            cardsOnHand: [
                                createCard({ id: 'C5A' })
                            ],
                            cardsInZone: [
                                createCard({ id: 'C3A', type: 'duration', commonId: ExpansionCommonId })
                            ],
                            stationCards: [
                                { place: 'draw', id: 'C1A', card: createCard({ id: 'C1A' }) },
                                { place: 'draw', id: 'C2A', card: createCard({ id: 'C2A' }) }
                            ],
                            events: [
                                PutDownCardEvent({ turn: 1, location: 'station-draw', cardId: 'C1A' }),
                                PutDownCardEvent({ turn: 1, location: 'station-draw', cardId: 'C2A' })
                            ]
                        },
                    },
                    deckByPlayerId: {
                        'P2A': FakeDeck.realDeckFromCards([
                            createCard({ id: 'C3A' }),
                            createCard({ id: 'C4A' })
                        ])
                    }
                }));

                const options = { location: 'station-draw', cardId: 'C5A' };
                this.error = catchError(() => this.match.putDownCard('P1A', options));
            },
            'should throw'() {
                assert(this.error);
                assert.equals(this.error.message, 'Cannot put down more station cards this turn');
            },
            'should NOT have put down third station card'() {
                refute.called(this.firstPlayerConnection.stateChanged);
            },
            'should NOT add requirement to second player'() {
                this.match.start();
                assert.calledWith(this.secondPlayerConnection.restoreState, sinon.match({
                    requirements: []
                }));
            }
        }
    }
}
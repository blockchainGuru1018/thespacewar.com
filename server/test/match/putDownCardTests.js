const {
    bocha: {
        stub,
        assert,
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
} = require('./shared.js');

module.exports = {
    'when card is NOT in hand should throw error': function () {
        let match = createMatch({
            players: createPlayers([{ id: 'P1A' }])
        });
        match.start();
        match.start();
        const putDownCardOptions = { location: 'zone', cardId: 'C1A' };

        let error = catchError(() => match.putDownCard('P1A', putDownCardOptions));

        assert.equals(error.message, 'Card is not on hand');
        assert.equals(error.type, 'CheatDetected');
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

        assert.equals(error.message, 'Cannot put down more than one station card on the same turn');
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
    }
}
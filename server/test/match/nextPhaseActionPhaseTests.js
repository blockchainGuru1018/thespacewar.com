const {
    bocha: {
        sinon,
        assert,
        refute,
    },
    FakeDeckFactory,
    createCard,
    Player,
    createPlayer,
    createMatchAndGoToFirstActionPhase,
    createMatchAndGoToSecondActionPhase,
    createMatch,
    FakeConnection2,
    catchError,
    createState,
} = require('./shared.js');
const energyShieldId = 21;

module.exports = {
    'when put down station card should NOT lose any action points': {
        async setUp() {
            this.playerConnection = FakeConnection2(['restoreState']);
            this.match = createMatchAndGoToFirstActionPhase({
                deckFactory: FakeDeckFactory.fromCards([
                    createCard({ id: 'C1A', cost: 1 }),
                ]),
                players: [createPlayer({ id: 'P1A', connection: this.playerConnection })]
            });

            this.match.putDownCard('P1A', { location: 'station-draw', cardId: 'C1A' });
        },
        'when restore state should have correct amount of action points': function () {
            this.match.start();
            assert.calledWith(this.playerConnection.restoreState, sinon.match({
                actionPoints: 6
            }));
        }
    },
    'when put down a station card in action row and then put down card in zone': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [
                            createCard({ id: 'C1A', cost: 1 }),
                            createCard({ id: 'C2A', cost: 1 })
                        ],
                        stationCards: []
                    }
                }
            }));

            this.match.putDownCard('P1A', { location: 'station-action', cardId: 'C1A' });
            this.error = catchError(() => this.match.putDownCard('P1A', { location: 'zone', cardId: 'C2A' }));
        },
        'should NOT give error'() {
            refute(this.error);
        },
        'when restore state should have card in zone': function () {
            this.match.start();
            let { cardsInZone } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(cardsInZone.length, 1);
            assert.equals(cardsInZone[0].id, 'C2A');
        },
        'when restore state should have the new station card': function () {
            this.match.start();
            let { stationCards } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(stationCards.length, 1);
            assert.equals(stationCards[0].id, 'C1A');
            assert.equals(stationCards[0].place, 'action');
        }
    },
    'when has Energy shield in home zone and put down another Energy shield': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [
                            createCard({ id: 'C2A', cost: 1, commonId: energyShieldId })
                        ],
                        cardsInZone: [
                            createCard({ id: 'C1A', cost: 1, commonId: energyShieldId })
                        ],
                        stationCards: [{ card: createCard({ id: 'C3A' }), place: 'action' }]
                    }
                }
            }));

            this.error = catchError(() => this.match.putDownCard('P1A', { location: 'zone', cardId: 'C2A' }));
        },
        'should throw'() {
            assert(this.error);
            assert.equals(this.error.message, 'Cannot put down card');
        },
    },
    'when has Energy shield in home zone and put down another Energy shield as station card': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C2A', commonId: energyShieldId })],
                        cardsInZone: [createCard({ id: 'C1A', commonId: energyShieldId })]
                    }
                }
            }));

            this.error = catchError(() => this.match.putDownCard('P1A', { location: 'station-action', cardId: 'C2A' }));
        },
        'should NOT throw'() {
            refute(this.error);
        }
    },
    'when does NOT have Energy shield in home zone and put down an Energy shield in zone': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C2A', commonId: energyShieldId })]
                    }
                }
            }));

            this.error = catchError(() => this.match.putDownCard('P1A', { location: 'zone', cardId: 'C2A' }));
        },
        'should NOT throw'() {
            refute(this.error);
        }
    }
};
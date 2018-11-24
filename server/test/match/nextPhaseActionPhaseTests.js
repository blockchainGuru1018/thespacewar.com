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

module.exports = {
    'when is first player in first turn': {
        async setUp() {
            this.playerConnection = FakeConnection2(['setActionPoints']);
            this.match = createMatchAndGoToFirstActionPhase({
                players: [createPlayer({ id: 'P1A', connection: this.playerConnection })]
            });
        },
        'should emit action points'() {
            assert.calledOnce(this.playerConnection.setActionPoints);
            assert.calledWith(this.playerConnection.setActionPoints, 6);
        }
    },
    'when is second player in first turn': {
        async setUp() {
            this.playerConnection = FakeConnection2(['setActionPoints']);
            this.match = createMatchAndGoToSecondActionPhase({
                players: [
                    createPlayer({ id: 'P1A' }),
                    createPlayer({ id: 'P2A', connection: this.playerConnection })
                ]
            });
        },
        'should emit action points'() {
            assert.calledOnce(this.playerConnection.setActionPoints);
            assert.calledWith(this.playerConnection.setActionPoints, 6);
        }
    },
    'when leaves the action phase': {
        async setUp() {
            this.playerConnection = FakeConnection2(['setActionPoints', 'restoreState']);
            this.match = createMatchAndGoToFirstActionPhase({
                players: [createPlayer({ id: 'P1A', connection: this.playerConnection })]
            });

            this.match.nextPhase('P1A');
        },
        'should reset action points'() {
            let lastCallActionPoints = this.playerConnection.setActionPoints.lastCall.args[0];
            assert.equals(lastCallActionPoints, 6);
        },
        'when restore state should get correct amount of action points': function () {
            this.match.start();
            assert.calledWith(this.playerConnection.restoreState, sinon.match({
                actionPoints: 6
            }));
        }
    },
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
    }
};
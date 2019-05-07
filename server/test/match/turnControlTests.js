const {
    bocha: {
        stub,
        assert,
        refute,
        sinon
    },
    createCard,
    Player,
    createMatch,
    FakeConnection2,
    catchError,
    createState,
} = require('./shared.js');

module.exports = {
    'when player has taken control of the turn and put down a card costing 0': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection)] });
            this.match.restoreFromState(createState({
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        turn: 1,
                        phase: 'wait',
                        cardsOnHand: [
                            createCard({ id: 'C1A', type: 'spaceShip', cost: 0 })
                        ]
                    }
                }
            }));

            this.match.putDownCard('P1A', { cardId: 'C1A', location: 'zone' });
        },
        'should put down card'() {
            this.match.refresh('P1A');
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                cardsInZone: [sinon.match({ id: 'C1A' })]
            }));
        }
    },
    'when player has NOT taken control of the turn and put down a card costing 0': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection)] });
            this.match.restoreFromState(createState({
                currentPlayer: 'P2A',
                playerStateById: {
                    'P1A': {
                        turn: 1,
                        phase: 'wait',
                        cardsOnHand: [
                            createCard({ id: 'C1A', type: 'spaceShip', cost: 0 })
                        ]
                    }
                }
            }));

            this.error = catchError(() => this.match.putDownCard('P1A', { cardId: 'C1A', location: 'zone' }));
        },
        'should throw error'() {
            assert(this.error);
            assert(this.error.message, 'Cannot put down card');
        },
        'should NOT put down card'() {
            this.match.refresh('P1A');
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                cardsOnHand: [sinon.match({ id: 'C1A' })],
                cardsInZone: []
            }));
        }
    },
    'when player has NOT taken control of the turn and put down a station card': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection)] });
            this.match.restoreFromState(createState({
                currentPlayer: 'P2A',
                playerStateById: {
                    'P1A': {
                        turn: 1,
                        phase: 'wait',
                        cardsOnHand: [
                            createCard({ id: 'C1A', type: 'spaceShip', cost: 0 })
                        ],
                        stationCards: [{ card: createCard({ id: 'C2A' }) }]
                    }
                }
            }));

            this.error = catchError(() => this.match.putDownCard('P1A', { cardId: 'C1A', location: 'station-action' }));
        },
        'should throw error'() {
            assert(this.error);
            assert(this.error.message, 'Cannot put down card');
        },
        'should NOT put down card'() {
            this.match.refresh('P1A');
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                cardsOnHand: [sinon.match({ id: 'C1A' })],
                stationCards: [sinon.match({ id: 'C2A' })]
            }));
        }
    }
};

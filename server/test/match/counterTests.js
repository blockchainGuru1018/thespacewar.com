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
const StateAsserter = require('../testUtils/StateAsserter.js');
const Luck = require('../../../shared/card/Luck.js');

module.exports = {
    'counter:': {
        async setUp() {
            const firstPlayerConnection = FakeConnection2(['stateChanged']);
            const secondPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [Player('P1A', firstPlayerConnection), Player('P2A', secondPlayerConnection)];
            this.match = createMatch({ players });
            this.firstPlayerAsserter = StateAsserter(this.match, firstPlayerConnection, 'P1A');
            this.secondPlayerAsserter = StateAsserter(this.match, secondPlayerConnection, 'P2A');
        },
        'when put down Luck and choose counter': {
            async setUp() {
                this.match.restoreFromState(createState({
                    currentPlayer: 'P2A',
                    turn: 2,
                    playerStateById: {
                        'P1A': {
                            phase: 'wait',
                            cardsOnHand: [
                                createCard({ id: 'C2A', type: 'event', commonId: Luck.CommonId, cost: 0 })
                            ]
                        },
                        'P2A': {
                            phase: 'action',
                            cardsOnHand: [
                                createCard({ id: 'C1A', cost: 2 })
                            ],
                            stationCards: [
                                { id: 'S1A', card: createCard({ id: 'S1A' }), place: 'action' },
                            ],
                            events: [
                                { type: 'putDownCard', turn: 1, location: 'station-action', cardId: 'S1A' }
                            ]
                        }
                    }
                }));
                this.match.putDownCard('P2A', { cardId: 'C1A', location: 'zone' });
                this.match.toggleControlOfTurn('P1A');

                this.match.putDownCard('P1A', { cardId: 'C2A', location: 'zone', choice: 'counter' });
            },
            'should include legible cards in requirement "counterCard"'() {
                this.firstPlayerAsserter.send('P1A');
                this.firstPlayerAsserter.hasRequirement({
                    type: 'counterCard',
                    cardId: 'C2A',
                    count: 1,
                    cardGroups: [
                        { source: 'opponentAny', cards: [sinon.match({ id: 'C1A' })] }
                    ]
                });
            }
        }
    }
};

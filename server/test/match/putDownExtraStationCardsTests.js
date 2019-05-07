const {
    bocha: {
        refute,
    },
    createCard,
    Player,
    createMatch,
    FakeConnection2,
    catchError,
    createState,
} = require('./shared.js');
const StateAsserter = require('../testUtils/StateAsserter.js');

module.exports = {
    async setUp() {
        const firstPlayerConnection = FakeConnection2(['stateChanged']);
        const secondPlayerConnection = FakeConnection2(['stateChanged']);
        const players = [Player('P1A', firstPlayerConnection), Player('P2A', secondPlayerConnection)];
        this.match = createMatch({ players });
        this.firstPlayerAsserter = StateAsserter(this.match, firstPlayerConnection, 'P1A');
        this.secondPlayerAsserter = StateAsserter(this.match, secondPlayerConnection, 'P2A');
    },
    'when "freeExtraStationCardGranted" event with count 1 for this turn and put down second station card': {
        async setUp() {
            this.match.restoreFromState(createState({
                playerStateById: {
                    turn: 1,
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C2A' })],
                        stationCards: [
                            stationCard({ id: 'C1A', flipped: false })
                        ],
                        events: [{ type: 'freeExtraStationCardGranted', count: 1, turn: 1 }]
                    }
                }
            }));

            this.error = catchError(() => this.match.putDownCard('P1A', { location: 'station-draw', cardId: 'C2A' }));
        },
        'should NOT throw an error'() {
            refute(this.error);
        },
        'should add station card'() {
            this.firstPlayerAsserter.send();
            this.firstPlayerAsserter.hasStationCard('C2A');
        }
    }
};

function stationCard({ place = 'draw', flipped, id }) {
    return {
        place,
        flipped,
        card: { id }
    };
}

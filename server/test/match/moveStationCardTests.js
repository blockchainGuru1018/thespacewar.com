const {
    bocha: {
        refute,
    },
    Player,
    createMatch,
    FakeConnection2,
    catchError,
    createState,
} = require('./shared.js');
const StateAsserter = require('../testUtils/StateAsserter.js');
const Commander = require("../../../shared/match/commander/Commander.js");

module.exports = {
    async setUp() {
        const firstPlayerConnection = FakeConnection2(['stateChanged']);
        const secondPlayerConnection = FakeConnection2(['stateChanged']);
        const players = [Player('P1A', firstPlayerConnection), Player('P2A', secondPlayerConnection)];
        this.match = createMatch({ players });
        this.firstPlayerAsserter = StateAsserter(this.match, firstPlayerConnection, 'P1A');
        this.secondPlayerAsserter = StateAsserter(this.match, secondPlayerConnection, 'P2A');
    },
    'can move station card': {
        async setUp() {
            this.match.restoreFromState(createState({
                playerStateById: {
                    turn: 1,
                    'P1A': {
                        phase: 'action',
                        stationCards: [
                            stationCard({ id: 'C1A', place: 'draw' })
                        ],
                        commanders: [Commander.KeveBakins]
                    }
                }
            }));

            const options = { cardId: 'C1A', location: 'station-action' };
            this.error = catchError(() => this.match.moveStationCard('P1A', options));
        },
        'should NOT throw an error'() {
            refute(this.error);
        },
        'should move station card'() {
            this.firstPlayerAsserter.send();
            this.firstPlayerAsserter.hasStationCardInRow('C1A', 'action');
        }
    }
};

function stationCard({ place = 'draw', flipped = 'false', id }) {
    return {
        place,
        flipped,
        card: { id }
    };
}

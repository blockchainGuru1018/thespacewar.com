const {
    Player,
    createMatch,
    FakeConnection2,
    createState,
} = require('./shared.js');
const StateAsserter = require('../testUtils/StateAsserter.js');

module.exports = {
    'overwork': {
        async setUp() {
            const firstPlayerConnection = FakeConnection2(['stateChanged']);
            const secondPlayerConnection = FakeConnection2(['stateChanged']);
            const players = [Player('P1A', firstPlayerConnection), Player('P2A', secondPlayerConnection)];
            this.match = createMatch({ players });
            this.firstPlayerAsserter = StateAsserter(this.match, firstPlayerConnection, 'P1A');
            this.secondPlayerAsserter = StateAsserter(this.match, secondPlayerConnection, 'P2A');
        },
        'when has 2 unflipped station cards': {
            async setUp() {
                this.match.restoreFromState(createState({
                    playerStateById: {
                        'P1A': {
                            phase: 'action',
                            stationCards: [
                                stationCard({ id: 'C1A', flipped: false }),
                                stationCard({ id: 'C2A', flipped: false })
                            ]
                        }
                    }
                }));

                this.match.overwork('P1A');
            },
            'should add 1 damage station card requirement to opponent': function () {
                this.secondPlayerAsserter.start();
                this.secondPlayerAsserter.hasRequirement({ type: 'damageStationCard', count: 1 });
            }
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

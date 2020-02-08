const {
    assert
} = require('../../testUtils/bocha-jest/bocha');
const {
    Player,
    createMatch,
    FakeConnection2,
    createState,
    catchError,
} = require('./shared.js');
const StateAsserter = require('../../testUtils/StateAsserter.js');
const GameConfig = require('../../../../shared/match/GameConfig.js');
const Commander = require("../../../../shared/match/commander/Commander.js");

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
                            ],
                            commanders: [Commander.GeneralJackson]
                        }
                    }
                }));

                this.match.overwork('P1A');
            },
            'should add 1 damage station card requirement to opponent': function () {
                this.secondPlayerAsserter.send();
                this.secondPlayerAsserter.hasRequirement({ type: 'damageStationCard', count: 1 });
            }
        }
    },
    'when player does NOT have General Jackson': {
        async setUp() {
            this.match = createMatch({
                gameConfig: GameConfig({}),
                players: [Player('P1A'), Player('P2A')]
            });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        stationCards: [
                            stationCard({ id: 'C1A', flipped: false }),
                            stationCard({ id: 'C2A', flipped: false })
                        ],
                        commanders: []
                    }
                }
            }));

            this.error = catchError(() => this.match.overwork('P1A'));
        },
        'should throw error': function () {
            assert(this.error);
            assert.equals(this.error.message, 'Cannot issue Overwork');
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

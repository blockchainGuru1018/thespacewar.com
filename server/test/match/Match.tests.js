const {
    bocha: {
        testCase,
        sinon,
        assert,
    },
    Player,
    createMatch,
    createState,
    FakeConnection2,
} = require('./shared.js');

module.exports = testCase('Match', {
    'draw card:': require('./drawCardTests.js'),
    'putDownCard:': require('./putDownCardTests.js'),
    'discardCard:': require('./discardCardTests.js'),
    'nextPhase:': require('./nextPhaseTests.js'),
    'nextPhase action phase:': require('./nextPhaseActionPhaseTests.js'),
    'discard phase': require('./discardPhaseTests.js'),
    'attack phase:': require('./attackPhaseTests.js'),
    'duration card:': require('./durationCardTests.js'),
    'behaviour card': require('./behaviourCardTests.js'),
    'damage station cards': require('./damageStationCardsTests.js'),
    'overwork': require('./overworkTests.js'),
    'putDownExtraStationCards': require('./putDownExtraStationCardsTests.js'),
    'moveStationCard': require('./moveStationCardTests.js'),
    'turnControlTests': require('./turnControlTests.js'),
    'counterTests': require('./counterTests.js'),
    'when first player retreats from match should emit updated game state with retreated player id': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged']);
            this.match = createMatch({
                players: [
                    Player('P1A', this.firstPlayerConnection),
                    Player('P2A', this.secondPlayerConnection)
                ]
            });
            this.match.restoreFromState(createState({}));

            this.match.retreat('P1A');
        },
        'when first player restore state should say opponent retreated'() {
            this.match.refresh('P1A');
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                retreatedPlayerId: 'P1A',
                ended: true
            }));
        },
        'when second player restore state should say opponent retreated'() {
            this.match.refresh('P2A');
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                retreatedPlayerId: 'P1A',
                ended: true
            }));
        },
        'when ask match if has ended should be true'() {
            assert(this.match.hasEnded());
        }
    }
});

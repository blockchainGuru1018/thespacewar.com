const {
    bocha: {
        testCase,
        sinon,
        assert,
    },
    Match,
    Player,
    createMatchAndGoToFirstActionPhase,
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
    'repair card': require('./repairCardTests.js'),
    'damage own station cards': require('./damageOwnStationCardsTests.js'),
    'when first player retreats from match should emit opponentRetreated to second player': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.secondPlayerConnection = FakeConnection2(['opponentRetreated', 'restoreState']);
            this.match = createMatchAndGoToFirstActionPhase({
                players: [
                    Player('P1A', this.firstPlayerConnection),
                    Player('P2A', this.secondPlayerConnection)
                ]
            });

            this.match.retreat('P1A');
        },
        'should emit opponentRetreated'() {
            assert.calledOnce(this.secondPlayerConnection.opponentRetreated);
        },
        'when first player restore state should say opponent retreated'() {
            this.match.start();
            assert.calledWith(this.firstPlayerConnection.restoreState, sinon.match({
                playerRetreated: true
            }));
        },
        'when second player restore state should say opponent retreated'() {
            this.match.start();
            assert.calledWith(this.secondPlayerConnection.restoreState, sinon.match({
                opponentRetreated: true
            }));
        },
        'when ask match if has ended should be true'() {
            assert(this.match.hasEnded());
        }
    }
});

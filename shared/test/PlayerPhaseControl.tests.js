let {
    testCase,
    assert,
    refute
} = require('bocha');
const TestHelper = require('./fakeFactories/TestHelper.js');
const createState = require('./fakeFactories/createState.js');

module.exports = testCase('PlayerPhaseControl', {
    'when game timer has ended and ends turn for player': {
        setUp() {
            this.testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                turn: 1,
                playerStateById: {
                    'P1A': {
                        phase: 'attack'
                    }
                }
            }));
            this.testHelper.stub('gameTimer', 'P1A', FakeGameTimer({ hasEnded: () => true }));

            const playerPhaseControl = this.testHelper.playerPhaseControl('P1A');
            playerPhaseControl.nextPhase();
        },
        'should set player as retreated'() {
            assert(this.testHelper.matchService().getRetreatedPlayerId() === 'P1A');
        }
    },
    'when game timer has NOT ended and ends turn for player': {
        setUp() {
            this.testHelper = TestHelper(createState({
                currentPlayer: 'P1A',
                turn: 1,
                playerStateById: {
                    'P1A': {
                        phase: 'attack'
                    }
                }
            }));
            this.testHelper.stub('gameTimer', 'P1A', FakeGameTimer({ hasEnded: () => false }));

            const playerPhaseControl = this.testHelper.playerPhaseControl('P1A');
            playerPhaseControl.nextPhase();
        },
        'should NOT set player as retreated'() {
            refute(this.testHelper.matchService().getRetreatedPlayerId() === 'P1A');
        }
    }
});

function stationCard(id, place) {
    return {
        place,
        flipped: false,
        card: { id }
    };
}

function FakeGameTimer(stubs) {
    return {
        switchTo() {},
        hasEnded() {},
        resetAll() {},
        ...stubs
    }
}

const {
    testCase,
    refute,
    assert
} = require('bocha');
const TestHelper = require('./fakeFactories/TestHelper.js');
const createState = require('./fakeFactories/createState.js');

module.exports = testCase('Turn control', {
    'can toggle turn control': {
        'when opponent phase is "start" and player does NOT have control of turn should NOT have permission'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P2A',
                playerStateById: {
                    'P1A': {
                        phase: 'wait'
                    },
                    'P2A': {
                        phase: 'start'
                    }
                }
            }));
            const turnControl = testHelper.turnControl('P1A');

            const hasPermission = turnControl.canToggleControlOfTurn();

            refute(hasPermission);
        },
        'when opponent phase is "draw" and it is the first turn should NOT have permission'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P2A',
                turn: 1,
                playerStateById: {
                    'P1A': {
                        phase: 'wait'
                    },
                    'P2A': {
                        phase: 'draw'
                    }
                }
            }));
            const turnControl = testHelper.turnControl('P1A');

            const hasPermission = turnControl.canToggleControlOfTurn();

            refute(hasPermission);
        },
        'when player phase is "wait" and opponent is in action phase of first turn'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P2A',
                turn: 1,
                playerStateById: {
                    'P1A': {
                        phase: 'wait'
                    },
                    'P2A': {
                        phase: 'action'
                    }
                }
            }));
            const turnControl = testHelper.turnControl('P1A');

            const hasPermission = turnControl.canToggleControlOfTurn();

            assert(hasPermission);
        }
    }
});
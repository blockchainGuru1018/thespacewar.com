const {
    testCase,
    refute
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
        }
    }
});

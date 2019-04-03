const {
    testCase,
    assert,
    refute
} = require('bocha');
const canIssueOverwork = require('../match/overwork/canIssueOverwork.js');

module.exports = testCase('canIssueOverwork', {
    'when has 2 unflipped station cards': function () {
        assert(canIssueOverwork({
            phase: 'action',
            unflippedStationCardCount: 2,
            hasRequirements: false
        }));
    },
    'when phase is NOT action phase and has 2 unflipped station cards': function () {
        refute(canIssueOverwork({
            phase: 'notActionPhase',
            unflippedStationCardCount: 2,
            hasRequirements: false
        }));
    },
    'when has 1 unflipped station card': function () {
        refute(canIssueOverwork({
            phase: 'action',
            unflippedStationCardCount: 1,
            hasRequirements: false
        }));
    },
    'when has any requirement': function () {
        refute(canIssueOverwork({
            phase: 'action',
            unflippedStationCardCount: 2,
            hasRequirements: true
        }));
    }
});
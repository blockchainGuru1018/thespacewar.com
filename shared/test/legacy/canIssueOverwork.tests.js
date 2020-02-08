const {
    assert,
    refute
} = require('../testUtils/bocha-jest/bocha');
const canIssueOverwork = require('../../match/overwork/canIssueOverwork.js');

module.exports = {
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
    },
    'when is action phase but is NOT the current player (the player in control)': function () {
        refute(canIssueOverwork({
            playerId: 'P1A',
            currentPlayer: 'P2A',
            phase: 'action',
            unflippedStationCardCount: 2,
            hasRequirements: false
        }));
    }
};

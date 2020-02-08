const {
    refute,
    assert
} = require('../testUtils/bocha-jest/bocha');
const TestHelper = require('../fakeFactories/TestHelper.js');
const createState = require('../fakeFactories/createState.js');
const DestinyDecided = require("../../card/DestinyDecided.js");

module.exports = {
    'can toggle turn control': {
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
    },
    'can NOT toggle control of turn:': {
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
        'when opponent has destiny decided in play can NOT toggle turn control'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P2A',
                turn: 1,
                playerStateById: {
                    'P1A': {
                        phase: 'wait'
                    },
                    'P2A': {
                        phase: 'action',
                        cardsInZone: [{ commonId: DestinyDecided.CommonId }]
                    }
                }
            }));
            const turnControl = testHelper.turnControl('P1A');

            const hasPermission = turnControl.canToggleControlOfTurn();

            refute(hasPermission);
        },
        'when player has destiny decided in play can NOT toggle turn control'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P2A',
                turn: 1,
                playerStateById: {
                    'P1A': {
                        phase: 'wait',
                        cardsInZone: [{ commonId: DestinyDecided.CommonId }]
                    },
                    'P2A': {
                        phase: 'action'
                    }
                }
            }));
            const turnControl = testHelper.turnControl('P1A');

            const hasPermission = turnControl.canToggleControlOfTurn();

            refute(hasPermission);
        }
    },
    'opponent has control of turn:': {
        'when is "current player" on players turn'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P2A',
                playerStateById: {
                    'P1A': {
                        phase: 'action'
                    },
                    'P2A': {
                        phase: 'wait'
                    }
                }
            }));

            const turnControl = testHelper.turnControl('P1A');

            assert(turnControl.opponentHasControl());
        },
        'when is "current player" on own turn'() {
            const testHelper = TestHelper(createState({
                currentPlayer: 'P2A',
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

            assert(turnControl.opponentHasControl());
        }
    }
};

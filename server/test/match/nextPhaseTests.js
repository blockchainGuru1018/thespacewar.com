const {
    bocha: {
        assert,
        refute,
        sinon
    },
    createCard,
    createPlayer,
    Player,
    createMatchAndGoToFirstAttackPhase,
    createMatchAndGoToSecondAttackPhase,
    createMatch,
    FakeConnection2,
    catchError,
    createState
} = require('./shared.js');
const DisturbingSensor = require('../../../shared/card/DisturbingSensor.js');
const PutDownCardEvent = require('../../../shared/PutDownCardEvent.js');
const GoodKarmaCommonId = '11';
const NeutralizationCommonId = '12';

module.exports = {
    'when is not own players turn should throw error': function () {
        let match = createMatch({
            players: [
                createPlayer({ id: 'P1A' }),
                createPlayer({ id: 'P2A' })
            ]
        });
        match.start();
        match.start();

        let error = catchError(() => match.nextPhase('P2A'));

        assert.equals(error.message, 'Switching phase when not your own turn');
        assert.equals(error.type, 'CheatDetected');
    },
    'when player of the turn is player one and current phase is the last one and go to next phase': {
        async setUp() {
            this.playerOneConnection = FakeConnection2(['nextPlayer']);
            this.playerTwoConnection = FakeConnection2(['nextPlayer']);
            let match = createMatchAndGoToFirstAttackPhase({
                players: [
                    createPlayer({ id: 'P1A', connection: this.playerOneConnection }),
                    createPlayer({ id: 'P2A', connection: this.playerTwoConnection })
                ]
            });

            match.nextPhase('P1A');
        },
        'should broadcast next player of the turn and turn count of 1 to playerOne'() {
            assert.calledWith(this.playerOneConnection.nextPlayer, { turn: 1, currentPlayer: 'P2A' });
        },
        'should broadcast next player of the turn and turn count of 1 to playerTwo'() {
            assert.calledWith(this.playerTwoConnection.nextPlayer, { turn: 1, currentPlayer: 'P2A' });
        }
    },
    'when player of the turn is player two and current phase is the last one': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['nextPlayer']);
            this.secondPlayerConnection = FakeConnection2(['nextPlayer']);
            let match = createMatchAndGoToSecondAttackPhase({
                players: [
                    createPlayer({ id: 'P1A', connection: this.firstPlayerConnection }),
                    createPlayer({ id: 'P2A', connection: this.secondPlayerConnection }),
                ]
            });

            match.nextPhase('P2A');
        },
        'should broadcast next player of the turn and turn count of 2 to first player'() {
            assert.calledWith(this.firstPlayerConnection.nextPlayer, { turn: 2, currentPlayer: 'P1A' });
        },
        'should broadcast next player of the turn and turn count of 2 to second player'() {
            assert.calledWith(this.secondPlayerConnection.nextPlayer, { turn: 2, currentPlayer: 'P1A' });
        }
    },
    'when first player has duration card in play and starting next turn': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['drawCards', 'restoreState']);
            this.match = createMatch({
                players: [Player('P1A', this.firstPlayerConnection), Player('P2A')]
            });
            this.match.restoreFromState(createState({
                turn: 1,
                currentPlayer: 'P2A',
                playerStateById: {
                    'P1A': {
                        phase: 'wait',
                        cardsInZone: [createCard({ id: 'C1A', type: 'duration' })],
                        events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })]
                    },
                    'P2A': {
                        phase: 'attack'
                    }
                }
            }));

            this.match.nextPhase('P2A');
        },
        'should NOT emit draw card to the first player': function () {
            refute.called(this.firstPlayerConnection.drawCards);
        },
        'first player should NOT have any cards on hand': function () {
            this.match.start();
            const { cardsOnHand } = this.firstPlayerConnection.restoreState.firstCall.args[0];
            assert.equals(cardsOnHand.length, 0);
        }
    },
    'when first player is in the preparation phase and goes to next phase': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['drawCards', 'restoreState']);
            this.match = createMatch({
                players: [Player('P1A', this.firstPlayerConnection), Player('P2A')]
            });
            this.match.restoreFromState(createState({
                turn: 2,
                currentPlayer: 'P1A',
                playerStateById: {
                    'P1A': {
                        phase: 'preparation',
                        cardsInZone: [createCard({ id: 'C1A', type: 'duration' })],
                        events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })]
                    }
                }
            }));

            this.match.nextPhase('P1A');
        },
        'should be in draw phase': function () {
            this.match.start();
            const { phase } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(phase, 'draw');
        }
    },
    'Neutralization:': {
        'when opponent has Neutralization and has Good Karma and leave draw phase': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.match = createMatch({
                    players: [Player('P1A', this.firstPlayerConnection), Player('P2A')]
                });
                this.match.restoreFromState(createState({
                    turn: 2,
                    currentPlayer: 'P1A',
                    playerStateById: {
                        'P1A': {
                            phase: 'draw',
                            cardsInZone: [createCard({ id: 'C1A', type: 'duration', commonId: GoodKarmaCommonId })],
                        },
                        'P2A': {
                            cardsInZone: [createCard({ id: 'C1A', type: 'duration', commonId: NeutralizationCommonId })]
                        }
                    }
                }));

                this.match.nextPhase('P1A');
            },
            'should emit state changed WITHOUT requirements'() {
                assert.calledOnce(this.firstPlayerConnection.stateChanged);
                refute.defined(this.firstPlayerConnection.stateChanged.lastCall.args[0].requirements);
            }
        }
    },
    'Disturbing sensor:': {
        'when opponent has disturbing sensor in play and player has 2 cards on hand and leaves draw phase': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
                this.match.restoreFromState(createState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    playerStateById: {
                        'P1A': {
                            phase: 'draw',
                            cardsOnHand: [
                                createCard({ id: 'C1A' }),
                                createCard({ id: 'C2A' })
                            ]
                        },
                        'P2A': {
                            cardsInZone: [
                                createCard({ id: 'C3A', type: 'spaceShip', commonId: DisturbingSensor.CommonId })
                            ]
                        }
                    }
                }));

                this.match.nextPhase('P1A');
            },
            'should emit requirement to player'() {
                assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    requirements: [
                        sinon.match({ type: 'discardCard', count: 1 })
                    ]
                }));
            }
        },
        'when opponent has disturbing sensor in play and player has 1 card on hand and leaves draw phase': {
            setUp() {
                this.firstPlayerConnection = FakeConnection2(['stateChanged']);
                this.match = createMatch({ players: [Player('P1A', this.firstPlayerConnection), Player('P2A')] });
                this.match.restoreFromState(createState({
                    turn: 1,
                    currentPlayer: 'P1A',
                    playerStateById: {
                        'P1A': {
                            phase: 'draw',
                            cardsOnHand: [createCard({ id: 'C1A' })]
                        },
                        'P2A': {
                            cardsInZone: [
                                createCard({ id: 'C3A', type: 'spaceShip', commonId: DisturbingSensor.CommonId })
                            ]
                        }
                    }
                }));

                this.match.nextPhase('P1A');
            },
            'should NOT emit requirement to player'() {
                refute.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                    requirements: sinon.match([
                        sinon.match({ type: 'discardCard', count: 1 })
                    ])
                }));
            }
        }
    }
};
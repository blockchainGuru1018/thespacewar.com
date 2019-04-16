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
const FakeDeck = require('../testUtils/FakeDeck.js');
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
    'when enter draw phase and has NO cards left in deck': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState']);
            this.secondPlayerConnection = FakeConnection2(['restoreState']);
            this.match = createMatch({
                players: [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
            });
            this.match.restoreFromState(createState({
                turn: 1,
                currentPlayer: 'P2A',
                playerStateById: {
                    'P1A': {
                        phase: 'wait',
                        stationCards: [
                            { card: createCard({ id: 'C1A' }) },
                            { card: createCard({ id: 'C2A' }) },
                            { card: createCard({ id: 'C3A' }) },
                        ]
                    },
                    'P2A': {
                        phase: 'attack'
                    }
                },
                deckByPlayerId: {
                    'P1A': FakeDeck.realDeckFromCards([])
                }
            }));

            this.match.nextPhase('P2A');
        },
        'should add damage station card requirement to second player'() {
            this.match.refresh('P2A');
            assert.calledWith(this.secondPlayerConnection.restoreState, sinon.match({
                requirements: [{
                    type: 'damageStationCard',
                    count: sinon.match.number,
                    common: true,
                    reason: 'emptyDeck'
                }]
            }));
        },
        'should add empty, but common, damage station card requirement to first player'() {
            //TODO Requirements should be common when both players perform the same kind of action, but here only one is.
            // The real intent is to have the first player wait for the other. Perhaps this could be implement in another
            // way that doesnt break the abstraction?
            this.match.refresh('P1A');
            assert.calledWith(this.firstPlayerConnection.restoreState, sinon.match({
                requirements: [{
                    type: 'damageStationCard',
                    count: 0,
                    common: true,
                    waiting: true,
                    reason: 'emptyDeck'
                }]
            }));
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
        'should be in action phase': function () {
            this.match.start();
            const { phase } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(phase, 'action');
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
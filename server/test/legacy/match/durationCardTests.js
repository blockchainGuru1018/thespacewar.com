const {
    bocha: {
        assert,
        refute,
        sinon
    },
    createCard,
    createDeckFromCards,
    Player,
    createMatch,
    FakeConnection2,
    catchError,
    createState,
} = require('./shared.js');
const PutDownCardEvent = require('../../../../shared/PutDownCardEvent.js');
const MoveCardEvent = require('../../../../shared/event/MoveCardEvent.js');

module.exports = {
    'when try to move duration card should throw error': function () {
        this.match = createMatch({ players: [Player('P1A'), Player('P2A')] });
        this.match.restoreFromState(createState({
            turn: 2,
            playerStateById: {
                'P1A': {
                    phase: 'attack',
                    cardsInZone: [createCard({ id: 'C1A', type: 'duration' })],
                    events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })]
                }
            }
        }));

        const error = catchError(() => this.match.moveCard('P1A', 'C1A'));

        assert(error);
        assert.equals(error.message, 'Cannot move card');
    },
    'when try to attack with duration card should throw error': function () {
        this.match = createMatch({ players: [Player('P1A'), Player('P2A')] });
        this.match.restoreFromState(createState({
            turn: 2,
            playerStateById: {
                'P1A': {
                    phase: 'attack',
                    cardsInZone: [createCard({ id: 'C1A', type: 'duration' })],
                    events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })]
                },
                'P2A': {
                    phase: 'attack',
                    cardsInOpponentZone: [createCard({ id: 'C2A' })],
                    events: [MoveCardEvent({ turn: 1, cardId: 'C2A' })]
                }
            }
        }));

        const error = catchError(() => this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' }));

        assert(error);
        assert.equals(error.message, 'Cannot attack');
    },
    'when try to attack a duration card should throw error': function () {
        this.match = createMatch({ players: [Player('P1A'), Player('P2A')] });
        this.match.restoreFromState(createState({
            turn: 2,
            playerStateById: {
                'P1A': {
                    phase: 'attack',
                    cardsInZone: [createCard({ id: 'C1A', attack: 1 })],
                    events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })]
                },
                'P2A': {
                    phase: 'attack',
                    cardsInOpponentZone: [createCard({ id: 'C2A', type: 'duration' })],
                    events: [MoveCardEvent({ turn: 1, cardId: 'C2A' })]
                }
            }
        }));

        const error = catchError(() => this.match.attack('P1A', { attackerCardId: 'C1A', defenderCardId: 'C2A' }));

        assert(error);
        assert.equals(error.message, 'Cannot attack that card');
    },
    'when player is in the preparation phase and discards duration card': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['stateChanged']);
            this.match = createMatch({
                players: [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
            });
            this.match.restoreFromState(createState({
                turn: 2,
                playerStateById: {
                    'P1A': {
                        phase: 'preparation',
                        cardsInZone: [createCard({ id: 'C1A', type: 'duration' })],
                        events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })]
                    }
                }
            }));

            this.match.discardDurationCard('P1A', 'C1A');
        },
        'first player should NOT have card in zone'() {
            this.match.refresh('P1A');
            const { cardsInZone } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
            assert.equals(cardsInZone.length, 0);
        },
        'first player should have card among discarded cards'() {
            this.match.refresh('P1A');
            const { discardedCards } = this.firstPlayerConnection.stateChanged.lastCall.args[0];
            assert.equals(discardedCards.length, 1);
            assert.match(discardedCards[0], { id: 'C1A' });
        },
        'should emit cards in zone to first player'() {
            assert.calledOnce(this.firstPlayerConnection.stateChanged);
            assert.calledWith(this.firstPlayerConnection.stateChanged, sinon.match({
                cardsInZone: [],
                discardedCards: [sinon.match({ id: 'C1A' })]
            }));
        },
        'should emit opponent cards in zone to second player'() {
            assert.calledOnce(this.secondPlayerConnection.stateChanged);
            assert.calledWith(this.secondPlayerConnection.stateChanged, sinon.match({
                opponentCardsInZone: []
            }));
        }
    },
    'when in preparation phase and has less than 0 action points and go to the next phase': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['opponentDiscardedDurationCard']);
            this.match = createMatch({
                actionPointsCalculator: {
                    calculate: () => -1
                },
                players: [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
            });
            this.match.restoreFromState(createState({
                turn: 2,
                playerStateById: {
                    'P1A': {
                        phase: 'preparation',
                        cardsInZone: [createCard({ id: 'C1A', type: 'duration' })],
                        events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })]
                    }
                }
            }));

            this.error = catchError(() => this.match.nextPhase('P1A', { currentPhase: 'preparation' }));
        },
        'should throw error'() {
            assert(this.error);
            assert.equals(this.error.message, 'Cannot go to next phase with less than 0 action points');
        },
    },
    'when player is NOT in preparation phase but discards duration card should throw error': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['stateChanged']);
            this.secondPlayerConnection = FakeConnection2(['opponentDiscardedDurationCard']);
            this.match = createMatch({
                actionPointsCalculator: {
                    calculate: () => -1
                },
                players: [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
            });
            this.match.restoreFromState(createState({
                turn: 2,
                playerStateById: {
                    'P1A': {
                        phase: 'discard',
                        cardsInZone: [createCard({ id: 'C1A', type: 'duration' })],
                        events: [PutDownCardEvent({ turn: 1, location: 'zone', cardId: 'C1A' })]
                    }
                }
            }));

            this.error = catchError(() => this.match.discardDurationCard('P1A', 'C1A'));
        },
        'should throw error'() {
            assert(this.error);
            assert.equals(this.error.message, 'Cannot discard duration cards after turn your has started');
        },
    }
};

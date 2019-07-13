const {
    bocha: {
        sinon,
        assert,
        refute,
    },
    FakeDeckFactory,
    createCard,
    createPlayer,
    createMatchAndGoToFirstDiscardPhase,
    FakeConnection2,
    catchError,
    createState,
    createMatch,
    Player
} = require('./shared.js');

module.exports = {
    'when has 8 cards entering discard phase of first turn and leaves without discarding should throw error': function () {
        this.firstPlayerConnection = FakeConnection2(['stateChanged']);
        this.secondPlayerConnection = FakeConnection2(['stateChanged']);
        this.match = createMatch({ players: [Player('P1A'),] });
        this.match.restoreFromState(createState({
            playerStateById: {
                'P1A': {
                    phase: 'discard',
                    stationCards: [{ place: 'action', card: createCard({ id: 'S1A' }) }],
                    cardsOnHand: [createCard({ id: 'C1A' })]
                }
            }
        }));

        let error = catchError(() => this.match.nextPhase('P1A', { currentPhase: 'discard' }));

        assert.equals(error.message, 'Cannot leave the discard phase without discarding enough cards');
        assert.equals(error.type, 'CheatDetected');
    },
    '//when exit first discard phase with 3 cards': { //TODO Refactor to use "this.match.setState" instead
        async setUp() {
            this.secondPlayerConnection = FakeConnection2(['opponentDiscardedCard']);
            let match = createMatchAndGoToFirstDiscardPhase({
                deckFactory: FakeDeckFactory.fromCards([
                    createCard({ id: 'C1A' }),
                    createCard({ id: 'C2A' }),
                    createCard({ id: 'C3A' }),
                    createCard({ id: 'C4A' }),
                    createCard({ id: 'C5A' })
                ]),
                players: [createPlayer({ id: 'P1A' }), createPlayer({
                    id: 'P2A',
                    connection: this.secondPlayerConnection
                })]
            });
            match.discardCard('P1A', 'C1A');
            match.discardCard('P1A', 'C2A');
            match.discardCard('P1A', 'C3A');
            match.discardCard('P1A', 'C4A');
            match.discardCard('P1A', 'C5A');

            this.error = catchError(() => match.nextPhase('P1A'));
        },
        'should NOT throw an error'() {
            refute(this.error);
        },
        'should emit opponentDiscardedCard to second player for each discarded card'() {
            assert.equals(this.secondPlayerConnection.opponentDiscardedCard.callCount, 5);
            assert.calledWith(this.secondPlayerConnection.opponentDiscardedCard, {
                discardedCard: sinon.match({ id: 'C1A' }),
                opponentCardCount: 7
            });
            assert.calledWith(this.secondPlayerConnection.opponentDiscardedCard, {
                discardedCard: sinon.match({ id: 'C2A' }),
                opponentCardCount: 6
            });
            assert.calledWith(this.secondPlayerConnection.opponentDiscardedCard, {
                discardedCard: sinon.match({ id: 'C3A' }),
                opponentCardCount: 5
            });
            assert.calledWith(this.secondPlayerConnection.opponentDiscardedCard, {
                discardedCard: sinon.match({ id: 'C4A' }),
                opponentCardCount: 4
            });
            assert.calledWith(this.secondPlayerConnection.opponentDiscardedCard, {
                discardedCard: sinon.match({ id: 'C5A' }),
                opponentCardCount: 3
            });
        }
    }
};

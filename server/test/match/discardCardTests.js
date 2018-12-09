const {
    bocha: {
        sinon,
        assert,
        refute,
    },
    FakeDeckFactory,
    createCard,
    createPlayer,
    createMatchAndGoToFirstActionPhase,
    createState,
    createMatch,
    Player,
    FakeDeck,
    FakeConnection2,
} = require('./shared.js');

module.exports = {
    'when is action phase and first player discards card': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState', 'setOpponentCardCount']);
            this.secondPlayerConnection = FakeConnection2(['opponentDiscardedCard']);
            const players = [Player('P1A', this.firstPlayerConnection), Player('P2A', this.secondPlayerConnection)]
            this.match = createMatch({ players });
            this.match.restoreFromState(createState({
                playerStateById: {
                    'P1A': {
                        phase: 'action',
                        cardsOnHand: [createCard({ id: 'C1A' })]
                    }
                },
                deckByPlayerId: {
                    'P2A': FakeDeck.fromCards([createCard({ id: 'C2A' })])
                }
            }));

            this.match.discardCard('P1A', 'C1A');
        },
        'should emit opponents new card count to first player'() {
            assert.calledOnce(this.firstPlayerConnection.setOpponentCardCount);
            assert.calledWith(this.firstPlayerConnection.setOpponentCardCount, 1);
        },
        'when restore state of first player should NOT have discarded card on hand'() {
            this.match.start();
            const { cardsOnHand } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(cardsOnHand.length, 0);
        },
        'should emit opponentDiscardedCard to second player'() {
            assert.calledOnce(this.secondPlayerConnection.opponentDiscardedCard);
            const {
                bonusCard,
                discardedCard,
                opponentCardCount
            } = this.secondPlayerConnection.opponentDiscardedCard.lastCall.args[0];
            assert.equals(bonusCard.id, 'C2A');
            assert.equals(discardedCard.id, 'C1A');
            assert.equals(opponentCardCount, 0);
        }
    }
};
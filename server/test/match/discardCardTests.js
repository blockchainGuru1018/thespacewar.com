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
    FakeConnection2,
} = require('./shared.js');

module.exports = {
    'when is action phase and first player discards card': {
        setUp() {
            this.firstPlayerConnection = FakeConnection2(['restoreState', 'setOpponentCardCount']);
            this.secondPlayerConnection = FakeConnection2(['opponentDiscardedCard']);
            this.cards = [
                createCard({ id: 'C1A' }), createCard({ id: 'C2A' }), createCard({ id: 'C3A' }),
                createCard({ id: 'C4A' }), createCard({ id: 'C5A' }), createCard({ id: 'C6A' }),
                createCard({ id: 'C7A' })
            ]
            this.match = createMatchAndGoToFirstActionPhase({
                deckFactory: FakeDeckFactory.fromCards(this.cards),
                players: [
                    createPlayer({ id: 'P1A', connection: this.firstPlayerConnection }),
                    createPlayer({ id: 'P2A', connection: this.secondPlayerConnection })
                ]
            });

            this.match.discardCard('P1A', 'C2A');
        },
        'should emit opponents new card count to first player'() {
            assert.calledOnce(this.firstPlayerConnection.setOpponentCardCount);
            assert.calledWith(this.firstPlayerConnection.setOpponentCardCount, 8);
        },
        'when restore state of first player should NOT have discarded card on hand'() {
            this.match.start();
            const { cardsOnHand } = this.firstPlayerConnection.restoreState.lastCall.args[0];
            assert.equals(cardsOnHand.length, 7);
            const discardedCardIsOnHand = cardsOnHand.some(c => c.id === 'C2A')
            refute(discardedCardIsOnHand);
        },
        'when restore state of first player should NOT have 2 additional action points'() {
            this.match.start();
            assert.calledWith(this.firstPlayerConnection.restoreState, sinon.match({
                actionPoints: 8
            }));
        },
        'should emit opponentDiscardedCard to second player'() {
            assert.calledOnce(this.secondPlayerConnection.opponentDiscardedCard);
            const {
                bonusCard,
                discardedCard,
                opponentCardCount
            } = this.secondPlayerConnection.opponentDiscardedCard.lastCall.args[0];
            assert.defined(bonusCard.id);
            assert.equals(discardedCard.id, 'C2A');
            assert.equals(opponentCardCount, 7);
        }
    }
};
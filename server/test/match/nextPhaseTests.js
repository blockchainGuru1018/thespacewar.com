const {
    bocha: {
        stub,
        assert,
    },
    FakeDeckFactory,
    createCard,
    createPlayer,
    createMatchAndGoToFirstAttackPhase,
    createMatchAndGoToSecondAttackPhase,
    createMatch,
    FakeConnection,
    FakeConnection2,
    catchError,
} = require('./shared.js');

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
    'when receive first next phase command from player of the turn': {
        async setUp() {
            this.drawCards = stub();
            this.restoreState = stub();
            const connection = FakeConnection({
                drawCards: this.drawCards,
                restoreState: this.restoreState
            });
            this.match = createMatch({
                deckFactory: FakeDeckFactory.fromCards([createCard({ id: 'C1A' })]),
                players: [createPlayer({ id: 'P1A', connection })]
            });
            this.match.start();
            this.match.start();

            this.match.nextPhase('P1A');
        },
        'should emit draw card with 1 card to the player of the turn': function () {
            assert.calledOnce(this.drawCards);

            const cards = this.drawCards.firstCall.args[0];
            assert.equals(cards.length, 1);
            assert.equals(cards[0].id, 'C1A');
        },
        'and get restore state should have added card on hand': function () {
            this.match.start();
            const { cardsOnHand } = this.restoreState.firstCall.args[0];
            assert.equals(cardsOnHand.length, 8);
        }
    },
    'when receive last next phase command from first player': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['drawCards', 'setOpponentCardCount']);
            this.secondPlayerConnection = FakeConnection2(['drawCards', 'restoreState']);
            this.match = createMatchAndGoToFirstAttackPhase({
                deckFactory: FakeDeckFactory.fromCards([createCard({ id: 'C1A' })]),
                players: [
                    createPlayer({ id: 'P1A', connection: this.firstPlayerConnection }),
                    createPlayer({ id: 'P2A', connection: this.secondPlayerConnection })
                ]
            });

            this.match.nextPhase('P1A');
        },
        'should NOT emit draw card again to first player'() {
            assert.calledOnce(this.firstPlayerConnection.drawCards);
        },
        'should emit setOpponentCardCount to first player': function () {
            assert.equals(this.firstPlayerConnection.setOpponentCardCount.lastCall.args[0], 8);
        },
        'should emit draw card with 1 card to second player': function () {
            assert.calledOnce(this.secondPlayerConnection.drawCards);

            const cards = this.secondPlayerConnection.drawCards.firstCall.args[0];
            assert.equals(cards.length, 1);
            assert.equals(cards[0].id, 'C1A');
        },
        'and get restore state should have added card on hand': function () {
            this.match.start();
            const { cardsOnHand } = this.secondPlayerConnection.restoreState.firstCall.args[0];
            assert.equals(cardsOnHand.length, 8);
        }
    },
    'when second player emits next phase on last phase of first turn': {
        async setUp() {
            this.firstPlayerConnection = FakeConnection2(['drawCards', 'restoreState']);
            this.secondPlayerConnection = FakeConnection2(['drawCards']);
            this.match = createMatchAndGoToSecondAttackPhase({
                deckFactory: FakeDeckFactory.fromCards([createCard({ id: 'C1A' })]),
                players: [
                    createPlayer({ id: 'P1A', connection: this.firstPlayerConnection }),
                    createPlayer({ id: 'P2A', connection: this.secondPlayerConnection })
                ]
            });

            this.match.nextPhase('P2A');
        },
        'should NOT emit draw card again to second player'() {
            assert.calledOnce(this.secondPlayerConnection.drawCards);
        },
        'should emit draw card with 1 card for the second time to the first player': function () {
            assert.calledTwice(this.firstPlayerConnection.drawCards);

            const cards = this.firstPlayerConnection.drawCards.secondCall.args[0];
            assert.equals(cards.length, 1);
            assert.equals(cards[0].id, 'C1A');
        },
        'and get restore state should have added card on hand on top of the 3 remaining after last discard phase': function () {
            this.match.start();

            const { cardsOnHand } = this.firstPlayerConnection.restoreState.firstCall.args[0];
            assert.equals(cardsOnHand.length, 4);
        }
    }
};
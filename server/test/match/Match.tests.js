let {
    testCase,
    stub,
    sinon,
    assert,
    refute,
    defaults
} = require('bocha');
let FakeDeckFactory = require('../testUtils/FakeDeckFactory.js');
let Match = require('../../match/Match.js');

//Explain: "player of the turn" is the current player of the turn. Both players will be the current player of the turn, once.
module.exports = testCase('Match', {
    'putDownCard:': {
        'when card is NOT in hand should throw error': async function () {
            let match = createMatch({
                players: createPlayers([{ id: 'P1A' }])
            });
            match.start();
            match.start();
            const putDownCardOptions = { location: 'zone', cardId: 'C1A' };

            let error = catchError(() => match.putDownCard('P1A', putDownCardOptions));

            assert.equals(error.message, 'Card is not on hand');
            assert.equals(error.type, 'CheatDetected');
        },
        'when does NOT have enough action points to place card in zone': async function () {
            const card = createCard({ id: 'C1A', cost: 7 });
            let match = createMatch({
                deckFactory: FakeDeckFactory.fromCards([card]),
                players: createPlayers([{ id: 'P1A' }])
            });
            match.start();
            match.start();
            const putDownCardOptions = { location: 'zone', cardId: 'C1A' };

            let error = catchError(() => match.putDownCard('P1A', putDownCardOptions));

            assert.equals(error.message, 'Cannot afford card');
            assert.equals(error.type, 'CheatDetected');
        },
        'when have just started game': {
            async setUp() {
                const restoreState = stub();
                const connection = FakeConnection({ restoreState });
                const player = createPlayer({ id: 'P1A', cost: 1, connection });
                let match = createMatch({ players: [player] });
                match.start();
                match.start();

                match.start();
                this.state = restoreState.firstCall.args[0];
            },
            'should have 7 cards on hand': function () {
                assert.equals(this.state.cardsOnHand.length, 7);
            },
            'should have correct amount and position of station cards': function () {
                assert.equals(this.state.stationCards.length, 5);
                assert.equals(this.state.stationCards.filter(c => c.place === 'draw').length, 1);
                assert.equals(this.state.stationCards.filter(c => c.place === 'action').length, 3);
                assert.equals(this.state.stationCards.filter(c => c.place === 'handSize').length, 1);
            },
            'should have 0 action points': function () {
                assert.equals(this.state.actionPoints, 0);
            },
            'should be first players turn': function () {
                assert.equals(this.state.currentPlayer, 'P1A');
            },
            'should be turn 1': function () {
                assert.equals(this.state.turn, 1);
            }
        },
        'when can afford card:': {
            async setUp() {
                const card = createCard({ id: 'C1A', cost: 1 });
                const restoreState = stub();
                const connection = FakeConnection({ restoreState });
                const match = createMatchAndGoToFirstActionPhase({
                    deckFactory: FakeDeckFactory.fromCards([card]),
                    players: [createPlayer({ id: 'P1A', cost: 1, connection })]
                });
                match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });

                match.start();
                this.state = restoreState.firstCall.args[0];
            },
            'should put card in zone': function () {
                assert.equals(this.state.cardsInZone, [{ id: 'C1A', cost: 1 }]);
            },
            'should remove card from hand': function () {
                assert.equals(this.state.cardsOnHand.length, 7);
            },
            'should add event': function () {
                assert.equals(this.state.events.length, 1);
                assert.match(this.state.events[0], {
                    type: 'putDownCard',
                    turn: 1,
                    location: 'zone',
                    cardId: 'C1A'
                });
            }
        },
        'when put down station card and has already put down a station this turn should throw error': async function () {
            let match = createMatchAndGoToFirstActionPhase({
                deckFactory: FakeDeckFactory.fromCards([
                    createCard({ id: 'C1A' }),
                    createCard({ id: 'C2A' })
                ]),
                players: [createPlayer({ id: 'P1A' })]
            });
            match.putDownCard('P1A', { location: 'station-draw', cardId: 'C1A' });

            let error = catchError(() => match.putDownCard('P1A', { location: 'station-draw', cardId: 'C2A' }));

            assert.equals(error.message, 'Cannot put down more than one station card on the same turn');
            assert.equals(error.type, 'CheatDetected');
        },
        'when put down card and is NOT your turn should throw error': async function () {
            let match = createMatchAndGoToFirstActionPhase({
                deckFactory: FakeDeckFactory.fromCards([
                    createCard({ id: 'C1A' }),
                    createCard({ id: 'C2A' })
                ]),
                players: [createPlayer({ id: 'P1A' })]
            });

            let error = catchError(() => match.putDownCard('P2A', { location: 'zone', cardId: 'C2A' }));

            assert.equals(error.message, 'Cannot put down card when it is not your turn');
            assert.equals(error.type, 'CheatDetected');
        }
    },
    'nextPhase:': {
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
    },
    'nextPhase action phase:': {
        'when is first player in first turn': {
            async setUp() {
                this.playerConnection = FakeConnection2(['setActionPoints']);
                this.match = createMatchAndGoToFirstActionPhase({
                    players: [createPlayer({ id: 'P1A', connection: this.playerConnection })]
                });
            },
            'should emit action points'() {
                assert.calledOnce(this.playerConnection.setActionPoints);
                assert.calledWith(this.playerConnection.setActionPoints, 6);
            }
        },
        'when is second player in first turn': {
            async setUp() {
                this.playerConnection = FakeConnection2(['setActionPoints']);
                this.match = createMatchAndGoToSecondActionPhase({
                    players: [
                        createPlayer({ id: 'P1A' }),
                        createPlayer({ id: 'P2A', connection: this.playerConnection })
                    ]
                });
            },
            'should emit action points'() {
                assert.calledOnce(this.playerConnection.setActionPoints);
                assert.calledWith(this.playerConnection.setActionPoints, 6);
            }
        }
    },
    'discard phase': {
        'when has 8 cards entering discard phase of first turn and leaves without discarding should throw error': async function () {
            let match = createMatchAndGoToFirstDiscardPhase({
                deckFactory: FakeDeckFactory.fromCards([
                    createCard({ id: 'C1A' })
                ]),
                players: [createPlayer({ id: 'P1A' })]
            });

            let error = catchError(() => match.nextPhase('P1A'));

            assert.equals(error.message, 'Cannot leave the discard phase without discarding enough cards');
            assert.equals(error.type, 'CheatDetected');
        },
        'when exit fist discard phase with 3 cards': {
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
    }
});

function createPlayers(playerOptions) {
    return [
        createPlayer(playerOptions[0] || {}),
        createPlayer(playerOptions[1] || {})
    ];
}

function createPlayer(options = {}) {
    return defaults(options, {
        id: '007',
        name: 'James',
        connection: FakeConnection2()
    });
}

function createMatchAndGoToFirstActionPhase(deps = {}) {
    const match = createMatch(deps);
    match.start();
    match.start();
    match.nextPhase(match.players[0].id);
    match.nextPhase(match.players[0].id);
    return match;
}

function createMatchAndGoToFirstDiscardPhase(deps = {}) {
    const match = createMatchAndGoToFirstActionPhase(deps);
    match.nextPhase(match.players[0].id);
    return match;
}

function createMatchAndGoToFirstAttackPhase(deps = {}) {
    const match = createMatch(deps);
    match.start();
    match.start();

    const [firstPlayer, secondPlayer] = match.players;
    match.nextPhase(firstPlayer.id);
    match.nextPhase(firstPlayer.id);
    match.nextPhase(firstPlayer.id);

    let firstPlayerCards;
    firstPlayer.connection.on('restoreState', state => {
        firstPlayerCards = state.cardsOnHand;
    });
    match.start();
    const cardsToDiscard = firstPlayerCards.slice(0, 5).map(card => card.id);
    discardCardsAsPlayer(cardsToDiscard, firstPlayer.id, match);

    match.nextPhase(firstPlayer.id);

    return match;
}

function createMatchAndGoToSecondActionPhase(deps = {}) {
    const match = createMatchAndGoToFirstAttackPhase(deps);
    match.nextPhase(match.players[0].id);

    match.nextPhase(match.players[1].id);
    return match;
}

function createMatchAndGoToSecondAttackPhase(deps = {}) {
    const match = createMatchAndGoToSecondActionPhase(deps);
    match.nextPhase(match.players[1].id);

    const [_, secondPlayer] = match.players;
    let secondPlayerCards;
    secondPlayer.connection.on('restoreState', state => {
        secondPlayerCards = state.cardsOnHand;
    });
    match.start();
    const cardsToDiscard = secondPlayerCards.slice(0, 5).map(card => card.id);
    discardCardsAsPlayer(cardsToDiscard, secondPlayer.id, match);

    match.nextPhase(match.players[1].id);

    return match;
}

function discardCardsAsPlayer(cardIds, playerId, match) {
    for (let i = 0; i < cardIds.length; i++) {
        match.discardCard(playerId, cardIds[i]);
    }
}

function createMatch(deps = {}) {
    if (deps.players && deps.players.length === 1) {
        deps.players.push(createPlayer());
    }
    defaults(deps, {
        deckFactory: FakeDeckFactory.fromCards([createCard()]),
        players: [createPlayer(), createPlayer()]
    });
    return Match(deps);
}

function createCard(options) {
    return defaults(options, {
        id: 'DEFAULT_TEST_CARD_ID',
        cost: 0
    });
}

function catchError(callback) {
    try {
        callback();
    }
    catch (error) {
        return error;
    }
}

function FakeConnection(listenerByActionName) { // TODO Migrate this to the new and then rename the new one to this name
    return {
        emit(_, { action, value }) {
            if (listenerByActionName[action]) {
                listenerByActionName[action](value);
            }
        }
    };
}

function FakeConnection2(namesOfActionsToStub = []) {
    const stubMap = {};
    for (let name of namesOfActionsToStub) {
        stubMap[name] = stub();
    }
    const listenersByActionName = {};

    return {
        emit(_, { action, value }) {
            if (stubMap[action]) {
                stubMap[action](value);
            }
            if (listenersByActionName[action]) {
                listenersByActionName[action].forEach(listener => listener(value));
            }
        },
        on(action, callback) {
            listenersByActionName[action] = listenersByActionName[action] || [];
            listenersByActionName[action].push(callback);
        },
        ...stubMap
    };
}
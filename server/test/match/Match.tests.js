let {
    testCase,
    stub,
    assert,
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
                this.nextPlayerForPlayerOne = stub();
                this.nextPlayerForPlayerTwo = stub();
                const playerOneConnection = FakeConnection({ nextPlayer: this.nextPlayerForPlayerOne });
                const playerTwoConnection = FakeConnection({ nextPlayer: this.nextPlayerForPlayerTwo });
                let match = createMatch({
                    players: [
                        createPlayer({ id: 'P1A', connection: playerOneConnection }),
                        createPlayer({ id: 'P2A', connection: playerTwoConnection })
                    ]
                });
                match.start();
                match.start();
                match.nextPhase('P1A');
                match.nextPhase('P1A');
                match.nextPhase('P1A');
                match.nextPhase('P1A');

                match.nextPhase('P1A');
            },
            'should broadcast next player of the turn and turn count of 1 to playerOne'() {
                assert.calledWith(this.nextPlayerForPlayerOne, { turn: 1, currentPlayer: 'P2A' });
            },
            'should broadcast next player of the turn and turn count of 1 to playerTwo'() {
                assert.calledWith(this.nextPlayerForPlayerTwo, { turn: 1, currentPlayer: 'P2A' });
            }
        },
        'when player of the turn is player two and current phase is the last one': {
            async setUp() {
                this.nextPlayerForFirstPlayer = stub();
                const firstPlayerConnection = FakeConnection({ nextPlayer: this.nextPlayerForFirstPlayer });
                this.nextPlayerForSecondPlayer = stub();
                const secondPlayerConnection = FakeConnection({ nextPlayer: this.nextPlayerForSecondPlayer });
                let match = createMatch({
                    players: [
                        createPlayer({ id: 'P1A', connection: firstPlayerConnection }),
                        createPlayer({ id: 'P2A', connection: secondPlayerConnection }),
                    ]
                });
                match.start();
                match.start();
                match.nextPhase('P1A');
                match.nextPhase('P1A');
                match.nextPhase('P1A');
                match.nextPhase('P1A');
                match.nextPhase('P1A');

                match.nextPhase('P2A');
                match.nextPhase('P2A');
                match.nextPhase('P2A');

                match.nextPhase('P2A');
            },
            'should broadcast next player of the turn and turn count of 2 to first player'() {
                assert.calledWith(this.nextPlayerForFirstPlayer, { turn: 2, currentPlayer: 'P1A' });
            },
            'should broadcast next player of the turn and turn count of 2 to second player'() {
                assert.calledWith(this.nextPlayerForSecondPlayer, { turn: 2, currentPlayer: 'P1A' });
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
                this.firstPlayerDrawCards = stub();
                this.firstPlayerSetOpponentCardCount = stub();
                const firstPlayerConnection = FakeConnection({
                    drawCards: this.firstPlayerDrawCards,
                    setOpponentCardCount: this.firstPlayerSetOpponentCardCount
                });
                this.secondPlayerDrawCards = stub();
                this.secondPlayerRestoreState = stub();
                const secondPlayerConnection = FakeConnection({
                    drawCards: this.secondPlayerDrawCards,
                    restoreState: this.secondPlayerRestoreState
                });
                this.match = createMatch({
                    deckFactory: FakeDeckFactory.fromCards([createCard({ id: 'C1A' })]),
                    players: [
                        createPlayer({ id: 'P1A', connection: firstPlayerConnection }),
                        createPlayer({ id: 'P2A', connection: secondPlayerConnection })
                    ]
                });
                this.match.start();
                this.match.start();
                this.match.nextPhase('P1A');
                this.match.nextPhase('P1A');
                this.match.nextPhase('P1A');
                this.match.nextPhase('P1A');

                this.match.nextPhase('P1A');
            },
            'should NOT emit draw card again to first player'() {
                assert.calledOnce(this.firstPlayerDrawCards);
            },
            'should emit draw card with 1 card to second player': function () {
                assert.calledOnce(this.secondPlayerDrawCards);

                const cards = this.secondPlayerDrawCards.firstCall.args[0];
                assert.equals(cards.length, 1);
                assert.equals(cards[0].id, 'C1A');
            },
            'should emit setOpponentCardCount as 8 to first player': function () {
                assert.calledOnce(this.firstPlayerSetOpponentCardCount);
                assert.calledWith(this.firstPlayerSetOpponentCardCount, 8);
            },
            'and get restore state should have added card on hand': function () {
                this.match.start();
                const { cardsOnHand } = this.secondPlayerRestoreState.firstCall.args[0];
                assert.equals(cardsOnHand.length, 8);
            }
        },
        'when second player emits next phase on last phase of first turn': {
            async setUp() {
                this.firstPlayerDrawCards = stub();
                this.firstPlayerRestoreState = stub();
                const firstPlayerConnection = FakeConnection({
                    drawCards: this.firstPlayerDrawCards,
                    restoreState: this.firstPlayerRestoreState
                });
                this.secondPlayerDrawCards = stub();
                const secondPlayerConnection = FakeConnection({
                    drawCards: this.secondPlayerDrawCards
                });
                this.match = createMatch({
                    deckFactory: FakeDeckFactory.fromCards([createCard({ id: 'C1A' })]),
                    players: [
                        createPlayer({ id: 'P1A', connection: firstPlayerConnection }),
                        createPlayer({ id: 'P2A', connection: secondPlayerConnection })
                    ]
                });
                this.match.start();
                this.match.start();
                this.match.nextPhase('P1A');
                this.match.nextPhase('P1A');
                this.match.nextPhase('P1A');
                this.match.nextPhase('P1A');
                this.match.nextPhase('P1A');

                this.match.nextPhase('P2A');
                this.match.nextPhase('P2A');
                this.match.nextPhase('P2A');

                this.match.nextPhase('P2A');
            },
            'should NOT emit draw card again to second player'() {
                assert.calledOnce(this.secondPlayerDrawCards);
            },
            'should emit draw card with 1 card for the second time to the first player': function () {
                assert.calledTwice(this.firstPlayerDrawCards);

                const cards = this.firstPlayerDrawCards.secondCall.args[0];
                assert.equals(cards.length, 1);
                assert.equals(cards[0].id, 'C1A');
            },
            'and get restore state should have added card on hand': function () {
                this.match.start();

                const { cardsOnHand } = this.firstPlayerRestoreState.firstCall.args[0];
                assert.equals(cardsOnHand.length, 9);
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
        connection: createConnection()
    });
}

function createConnection() {
    return {
        emit() {
        }
    };
}

function createMatchAndGoToFirstActionPhase(deps = {}) {
    const match = createMatch(deps);
    match.start();
    match.start();
    match.nextPhase(match.players[0].id);
    match.nextPhase(match.players[0].id);
    return match;
}

function createMatchAndGoToSecondActionPhase(deps = {}) {
    const match = createMatch(deps);
    match.start();
    match.start();

    match.nextPhase(match.players[0].id);
    match.nextPhase(match.players[0].id);
    match.nextPhase(match.players[0].id);
    match.nextPhase(match.players[0].id);
    match.nextPhase(match.players[0].id);

    match.nextPhase(match.players[1].id);

    return match;
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

function FakeConnection2(namesOfActionsToStub) {
    const stubMap = {};
    for (let name of namesOfActionsToStub) {
        stubMap[name] = stub();
    }
    return {
        emit(_, { action, value }) {
            if (stubMap[action]) {
                stubMap[action](value);
            }
        },
        ...stubMap
    };
}
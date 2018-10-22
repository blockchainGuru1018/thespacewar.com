let {
    testCase,
    stub,
    assert,
    defaults
} = require('bocha');
let FakeDeckFactory = require('../testUtils/FakeDeckFactory.js');
let Match = require('../../match/Match.js');

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
            'should have 6 action points': function () {
                assert.equals(this.state.actionPoints, 6);
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
                const player = createPlayer({ id: 'P1A', cost: 1, connection });
                let match = createMatch({
                    deckFactory: FakeDeckFactory.fromCards([card]),
                    players: [player]
                });
                match.start();
                match.start();

                match.putDownCard('P1A', { location: 'zone', cardId: 'C1A' });

                match.start();
                this.state = restoreState.firstCall.args[0];
            },
            'should put card in zone': function () {
                assert.equals(this.state.cardsInZone, [{ id: 'C1A', cost: 1 }]);
            },
            'should remove card from hand': function () {
                assert.equals(this.state.cardsOnHand.length, 6);
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

function FakeConnection(listenerByActionName) {
    return {
        emit(_, { action, value }) {
            if (listenerByActionName[action]) {
                listenerByActionName[action](value);
            }
        }
    };
}
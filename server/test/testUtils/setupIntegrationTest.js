const createMatch = require('./createMatch.js');
const Player = require('./Player.js');
const FakeConnection = require('./FakeConnection.js');
const createState = require('./createState.js');
const StateAsserter = require('./StateAsserter.js');

module.exports = function setup(state, { playerId = 'P1A', opponentId = 'P2A', matchDeps = {} } = {}) {
    const firstPlayerConnection = FakeConnection(['stateChanged']);
    const secondPlayerConnection = FakeConnection(['stateChanged']);
    const players = [Player(playerId, firstPlayerConnection), Player(opponentId, secondPlayerConnection)];
    const match = createMatch({ players, ...matchDeps });
    const firstPlayerAsserter = StateAsserter(match, firstPlayerConnection, playerId);
    const secondPlayerAsserter = StateAsserter(match, secondPlayerConnection, opponentId);

    match.restoreFromState(createState(state));

    return {
        match,
        firstPlayerConnection,
        secondPlayerConnection,
        firstPlayerAsserter,
        secondPlayerAsserter
    };
};

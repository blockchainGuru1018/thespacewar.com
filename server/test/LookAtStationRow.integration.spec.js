const FakeCardDataAssembler = require('./testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const createMatch = require('./testUtils/createMatch.js');
const Player = require('./testUtils/Player.js');
const FakeConnection = require('./testUtils/FakeConnection.js');
const createState = require('./testUtils/createState.js');
const StateAsserter = require('./testUtils/StateAsserter.js');
const OverCapacity = require('../../shared/card/OverCapacity.js');

const OverCapacityCommonId = OverCapacity.CommonId;

test('trigger action "lookAtStationRow" for card OverCapacity', () => {
    const {
        firstPlayerAsserter,
        match
    } = setup({
        playerStateById: {
            turn: 1,
            'P1A': {
                phase: 'action',
                cardsInZone: [createCard({ id: 'C1A', commonId: OverCapacityCommonId })],
                stationCards: [stationCard({ place: 'handSize' })]
            },
            'P2A': {}
        }
    });

    match.lookAtStationRow('P1A', { cardId: 'C1A', stationRow: 'handSize' });

    firstPlayerAsserter.hasRequirement({ type: 'findCard', count: 1 });
});

function setup(state, { playerId = 'P1A', opponentId = 'P2A' } = {}) {
    const firstPlayerConnection = FakeConnection(['stateChanged']);
    const secondPlayerConnection = FakeConnection(['stateChanged']);
    const players = [Player(playerId, firstPlayerConnection), Player(opponentId, secondPlayerConnection)];
    const match = createMatch({ players });
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
}

function stationCard({ place = 'draw', flipped, id }) {
    return {
        place,
        flipped,
        card: { id }
    };
}

const {
    assert,
    sinon
} = require('./testUtils/bocha-jest/bocha-jest.js');
const FakeCardDataAssembler = require('./testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const createMatch = require('./testUtils/createMatch.js');
const Player = require('./testUtils/Player.js');
const FakeConnection = require('./testUtils/FakeConnection.js');
const createState = require('./testUtils/createState.js');
const StateAsserter = require('./testUtils/StateAsserter.js');
const FatalError = require('../../shared/card/FatalError.js');

const FatalErrorCommonId = FatalError.CommonId;

describe('when put down fatal error and choice as an opponent unflipped station card', () => {
    test('should throw error', () => {
        const { match } = setup({
            playerStateById: {
                turn: 1,
                'P1A': {
                    phase: 'action',
                    cardsOnHand: [createCard({ id: 'C1A', commonId: FatalError.CommonId })],
                },
                'P2A': {
                    stationCards: [
                        stationCard({ id: 'C2A', flipped: false }),
                        stationCard({ id: 'C3A', flipped: true }),
                    ]
                }
            }
        });

        const error = catchError(() => match.putDownCard('P1A', { location: 'zone', cardId: 'C1A', choice: 'C2A' }));

        expect(error).toBeTruthy();
        expect(error.message).toBe('Cannot put down card');
    });
});

describe('when put down Fatal Error', () => {
    test('should emit draw card requirement to second player', () => {
        const {
            secondPlayerConnection,
            match
        } = setup({
            playerStateById: {
                'P1A': {
                    phase: 'action',
                    cardsOnHand: [createCard({ id: 'C1A', type: 'event', commonId: FatalErrorCommonId })]
                },
                'P2A': {
                    cardsInOpponentZone: [createCard({ id: 'C2A' })],
                    cardsInDeck: [
                        createCard({ id: 'C3A' }),
                        createCard({ id: 'C4A' })
                    ]
                }
            }
        });

        match.putDownCard('P1A', { location: 'zone', cardId: 'C1A', choice: 'C2A' });

        assert.calledOnce(secondPlayerConnection.stateChanged);
        assert.calledWith(secondPlayerConnection.stateChanged, sinon.match({
            requirements: [sinon.match({ type: 'drawCard', count: 2 })]
        }));
    });
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

function catchError(callback) {
    try {
        callback();
    }
    catch (error) {
        return error;
    }
}

function stationCard({ place = 'draw', flipped, id }) {
    return {
        place,
        flipped,
        card: { id }
    };
}

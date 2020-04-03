const {
    assert,
    refute,
    sinon
} = require('./testUtils/bocha-jest/bocha-jest.js');
const FakeCardDataAssembler = require('../../shared/test/testUtils/FakeCardDataAssembler.js');
const createCard = FakeCardDataAssembler.createCard;
const FatalError = require('../../shared/card/FatalError.js');
const setupIntegrationTest = require('./testUtils/setupIntegrationTest.js');

const FatalErrorCommonId = FatalError.CommonId;

test('when put down fatal error and choice as an opponent unflipped station card should throw error', () => {
    const { match } = setupIntegrationTest({
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

test('when put down fatal error and choice is a FLIPPED station card should NOT throw error', () => {
    const { match } = setupIntegrationTest({
        playerStateById: {
            turn: 1,
            'P1A': {
                phase: 'action',
                cardsOnHand: [createCard({ id: 'C1A', commonId: FatalError.CommonId })],
            },
            'P2A': {
                stationCards: [
                    stationCard({ id: 'C2A', flipped: true }),
                    stationCard({ id: 'C3A', flipped: false }),
                ]
            }
        }
    });

    const error = catchError(() => match.putDownCard('P1A', { location: 'zone', cardId: 'C1A', choice: 'C2A' }));

    expect(error).toBeFalsy();
});

test('when put down Fatal Error should emit draw card requirement to second player', () => {
    const {
        secondPlayerConnection,
        match
    } = setupIntegrationTest({
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

test('when put down Fatal Error for flipped station card should NOT emit draw card requirement to second player', () => {
    const {
        secondPlayerConnection,
        match
    } = setupIntegrationTest({
        playerStateById: {
            turn: 1,
            'P1A': {
                phase: 'action',
                cardsOnHand: [createCard({ id: 'C1A', commonId: FatalError.CommonId })],
            },
            'P2A': {
                stationCards: [
                    stationCard({ id: 'C2A', flipped: true }),
                    stationCard({ id: 'C3A', flipped: false }),
                ]
            }
        }
    });

    match.putDownCard('P1A', { location: 'zone', cardId: 'C1A', choice: 'C2A' });

    assert.calledOnce(secondPlayerConnection.stateChanged);
    refute.calledWith(secondPlayerConnection.stateChanged, sinon.match({
        requirements: [sinon.match({ type: 'drawCard', count: 2 })]
    }));
});

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

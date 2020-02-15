const Command = require('../match/command/LookAtStationRowCommand.js');

test('when can look at station row should perform action', () => {
    const doIt = jest.fn();
    const card = {};
    const command = createCommand({
        lookAtStationRow: lookAtStationRow({
            doIt,
            cardCanDoIt: cardId => cardId === 'C2A',
        }),
        playerCardFactory: {
            fromId: cardId => cardId === 'C2A' ? card : null
        }
    });

    command({ cardId: 'C2A', stationRow: 'handSize' });

    expect(doIt).toBeCalledWith(card, 'handSize');
});

test('when station row is NOT handSize should throw error', () => {
    const doIt = jest.fn();
    const playerCardFactory = {
        fromId: () => ({})
    };
    const command = createCommand({
        lookAtStationRow: lookAtStationRow({ doIt }),
        playerCardFactory
    });

    const error = catchError(() => command({ cardId: 'C2A', stationRow: 'action' }));

    expect(error).toBeDefined();
    expect(error.message).toBe('Can currently only look at handSize station row');
    expect(doIt).not.toBeCalled();
});

test('when can NOT perform action, should not perform it and throw error', () => {
    const doIt = jest.fn();
    const command = createCommand({
        lookAtStationRow: lookAtStationRow({
            doIt,
            cardCanDoIt: () => false
        })
    });

    const error = catchError(() => command({ cardId: 'C2A', stationRow: 'handSize' }));

    expect(error).toBeDefined();
    expect(error.message).toBe('Cannot look at station row');
    expect(doIt).not.toBeCalled();
});

function createCommand(options = {}) {
    return Command({
        lookAtStationRow: lookAtStationRow(),
        playerCardFactory: { fromId: () => ({}) },
        ...options
    });
}

function lookAtStationRow(options = {}) {
    return {
        cardCanDoIt: () => true,
        doIt: () => {},
        ...options
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

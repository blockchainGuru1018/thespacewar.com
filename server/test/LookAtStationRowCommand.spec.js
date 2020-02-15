const Command = require('../match/command/LookAtStationRowCommand.js');

test('get card and trigger effect', () => {
    const lookAtStationRow = {
        doIt: jest.fn(),
        cardCanDoIt: cardId => cardId === 'C2A',
    };
    const command = Command({
        lookAtStationRow
    });

    command({ cardId: 'C2A' });

    expect(lookAtStationRow.doIt).toBeCalled();
});

test('when can NOT perform action, should not perform it', () => {
    const lookAtStationRow = {
        cardCanDoIt: () => false,
        doIt: jest.fn()
    };
    const command = Command({ lookAtStationRow });

    catchError(() => command({ cardId: 'C2A' }));

    expect(lookAtStationRow.doIt).not.toBeCalled();
});

test('when can NOT perform action, should throw an error!', () => {
    const lookAtStationRow = {
        cardCanDoIt: () => false,
        doIt: jest.fn()
    };
    const command = Command({ lookAtStationRow });

    const error = catchError(() => command({ cardId: 'C2A' }));

    expect(error).toBeDefined();
    expect(error.message).toBe('Cannot look at station row');
});

function catchError(callback) {
    try {
        callback();
    }
    catch (error) {
        return error;
    }
}

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

test('when can NOT perform action', () => {
    const lookAtStationRow = {
        cardCanDoIt: () => false,
        doIt: jest.fn()
    };
    const command = Command({ lookAtStationRow });

    command({ cardId: 'C2A' });

    expect(lookAtStationRow.doIt).not.toBeCalled();
});

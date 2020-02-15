const LookAtStationRow = require('../match/command/LookAtStationRow.js');

test('get card and trigger effect', () => {
    const otherCard = { id: 'C1A' };
    const card = { id: 'C2A', lookAtHandSizeStationRow: jest.fn() };
    const command = LookAtStationRow({
        cardsThatCanLookAtHandSizeStationRow: () => [otherCard, card]
    });

    command({ cardId: 'C2A' });

    expect(card.lookAtHandSizeStationRow).toBeCalled();
});

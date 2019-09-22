/**
 * @jest-environment node
 */
const Capability = require('../../../ai/cardCapabilities/AttackStationCardCapability.js');

test('when attack is 2 and opponent has 3 unflipped station cards should target first 2 cards', () => {
    const matchController = { emit: jest.fn() };
    const capability = Capability({
        card: { id: 'C1A', attack: 2 },
        opponentStateService: {
            getUnflippedStationCards: () => [
                unflippedStationCard('S1A'),
                unflippedStationCard('S2A'),
                unflippedStationCard('S3A')
            ]
        },
        matchController
    });

    capability.doIt();

    expect(matchController.emit).toBeCalledWith('attackStationCard', {
        attackerCardId: 'C1A',
        targetStationCardIds: ['S1A', 'S2A']
    })
});

function unflippedStationCard(id, place = 'draw') {
    return { id, place };
}

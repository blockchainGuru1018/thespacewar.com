/**
 * @jest-environment node
 */
const Capability = require('../../../ai/cardCapabilities/RepairCardCapability.js');

test('can perform when has card to repair', () => {
    const capability = Capability({
        card: Card({
            canRepair: () => true
        })
    });
    expect(capability.canDoIt()).toBe(true);
});

test('should prioritize cards', () => {
    const matchController = { emit: jest.fn() };
    const capability = Capability({
        card: Card({
            id: 'C1A',
            canRepair: () => true,
            canRepairCard: () => true
        }),
        playerStateService: {
            getMatchingBehaviourCardsFromZoneOrStation: () => [{ id: 'C1A' }, { id: 'C2A' }]
        },
        repairCardPriority: cards => cards.some(c => c.id === 'C2A') && 'C2A',
        matchController
    });

    capability.doIt();

    expect(matchController.emit).toBeCalledWith('repairCard', { repairerCardId: 'C1A', cardToRepairId: 'C2A' });
});

function Card(options) {
    return {
        ...options
    };
}

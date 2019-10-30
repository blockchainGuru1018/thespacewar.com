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

function Card(options) {
    return {
        ...options
    };
}

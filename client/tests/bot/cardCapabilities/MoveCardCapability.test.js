/**
 * @jest-environment node
 */
const Capability = require('../../../ai/cardCapabilities/MoveCardCapability.js');

test('when card is a missile can NOT move', () => {
    const capability = Capability({
        card: { canMove: () => true, type: 'missile' }
    });
    expect(capability.canDoIt()).toBe(false);
});

/**
 * @jest-environment node
 */
const Capability = require('../../../ai/cardCapabilities/MoveCardCapability.js');

test('when card can attack card in other zone should NOT move', () => {
    const capability = Capability({
        card: { canMove: () => true, canAttackCardsInOtherZone: () => true }
    });
    expect(capability.canDoIt()).toBe(false);
});

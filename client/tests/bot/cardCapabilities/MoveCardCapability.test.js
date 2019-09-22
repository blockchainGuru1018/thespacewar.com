/**
 * @jest-environment node
 */
const Capability = require('../../../ai/cardCapabilities/MoveCardCapability.js');

test('when card can attack card in other zone should NOT move', () => {
    const capability = Capability({
        card: Card({ canMove: () => true, canAttackCardsInOtherZone: () => true })
    });
    expect(capability.canDoIt()).toBe(false);
});

test('when card has 0 in attack should NOT move', () => {
    const capability = Capability({
        card: Card({ canMove: () => true, attack: 0 })
    });
    expect(capability.canDoIt()).toBe(false);
});

function Card(options) {
    return {
        canAttackCardsInOtherZone() {},
        ...options
    };
}

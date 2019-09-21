/**
 * @jest-environment node
 */
const Capability = require('../../../ai/cardCapabilities/AttackInOpponentZoneCardCapability.js');

test('Player can attack if card in opponent zone and there is an available target', () => {
    const capability = Capability({
        card: { inHomeZone: () => false }
    });

    expect(capability.canDoIt()).toBe(true);
});

test('Player can NOT attack if card is NOT in opponent zone', () => {
    const capability = Capability({
        card: { inHomeZone: () => true }
    });

    expect(capability.canDoIt()).toBe(false);
});

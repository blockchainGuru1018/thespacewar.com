/**
 * @jest-environment node
 */
const Capability = require('../../../ai/cardCapabilities/AttackInHomeZoneCardCapability.js');

test('Can NOT do it, when card is in home zone with available target, but can attack station should', () => {
    const target = { id: 'C1A' };
    const capability = Capability({
        card: {
            canAttackStationCards: () => true,
            canAttackCard: target => target.id === 'C1A'
        },
        opponentStateService: {
            getMatchingBehaviourCards: () => [target],
        }
    });

    expect(capability.canDoIt()).toBe(false);
});

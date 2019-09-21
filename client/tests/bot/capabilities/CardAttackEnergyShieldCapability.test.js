/**
 * @jest-environment node
 */
const AttackEnergyShieldCardCapability = require('../../../ai/capabilities/AttackEnergyShieldCardCapability.js');

test('when card is in opponents zone and opponent has energy shield in play', () => {
    const energyShield = { stopsStationAttack: () => true };
    const capability = AttackEnergyShieldCardCapability({
        card: {
            isInHomeZone: () => false
        },
        opponentStateService: {
            getMatchingBehaviourCards: matcher => matcher(energyShield) ? [energyShield] : []
        }
    });

    expect(capability.canDoIt()).toBe(true);
});

test('when card is NOT in opponents zone and opponent has energy shield in play', () => {
    const energyShield = { stopsStationAttack: () => true };
    const capability = AttackEnergyShieldCardCapability({
        card: {
            isInHomeZone: () => true
        },
        opponentStateService: {
            getMatchingBehaviourCards: matcher => matcher(energyShield) ? [energyShield] : []
        }
    });

    expect(capability.canDoIt()).toBe(false);
});

test('when perform capability should attack first available target', () => {
    const firstTarget = { id: 'C1A', };
    const secondTarget = { id: 'C2A' };
    const matchController = { emit: jest.fn() };
    const capability = AttackEnergyShieldCardCapability({
        card: {
            id: 'C3A',
        },
        opponentStateService: {
            getMatchingBehaviourCards: () => [firstTarget, secondTarget]
        },
        matchController
    });

    capability.doIt();

    expect(matchController.emit).toBeCalledWith('attack', { attackerCardId: 'C3A', defenderCardId: 'C1A' });
});


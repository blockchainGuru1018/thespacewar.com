/**
 * @jest-environment node
 */
const AttackEnergyShieldCardCapability = require("../../../ai/cardCapabilities/AttackEnergyShieldCardCapability.js");

test("when card is in opponents zone and opponent has energy shield in play", () => {
  const energyShield = { stopsStationAttack: () => true };
  const capability = AttackEnergyShieldCardCapability({
    card: {
      canAttackCard: () => true,
    },
    opponentStateService: {
      getMatchingBehaviourCards: (matcher) =>
        matcher(energyShield) ? [energyShield] : [],
    },
  });

  expect(capability.canDoIt()).toBe(true);
});

test("when perform capability should attack first available target", () => {
  const firstTarget = { id: "C1A" };
  const secondTarget = { id: "C2A" };
  const matchController = { emit: jest.fn() };
  const capability = AttackEnergyShieldCardCapability({
    card: {
      id: "C3A",
      canAttackCard: () => true,
    },
    opponentStateService: {
      getMatchingBehaviourCards: () => [firstTarget, secondTarget],
    },
    matchController,
  });

  capability.doIt();

  expect(matchController.emit).toBeCalledWith("attack", {
    attackerCardId: "C3A",
    defenderCardId: "C1A",
  });
});

test("when card can NOT attack energy shield should NOT be able to perform capability", () => {
  const energyShield = { stopsStationAttack: () => true };
  const capability = AttackEnergyShieldCardCapability({
    card: {
      canAttackCard: (otherCard) => otherCard !== energyShield,
    },
    opponentStateService: {
      getMatchingBehaviourCards: (matcher) =>
        matcher(energyShield) ? [energyShield] : [],
    },
  });

  expect(capability.canDoIt()).toBe(false);
});

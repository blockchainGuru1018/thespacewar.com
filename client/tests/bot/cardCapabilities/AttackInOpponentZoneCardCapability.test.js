/**
 * @jest-environment node
 */
const Capability = require("../../../ai/cardCapabilities/AttackInOpponentZoneCardCapability.js");

describe("canDoIt", () => {
  test("Player can attack if card in opponent zone and there is an available target", () => {
    const target = { id: "C1A" };
    const capability = Capability({
      card: {
        isInHomeZone: () => false,
        canAttackCard: (_target) => _target.id === "C1A",
      },
      opponentStateService: {
        getMatchingBehaviourCards: (matcher) =>
          matcher(target) ? [target] : null,
      },
    });

    expect(capability.canDoIt()).toBe(true);
  });

  test("Player can NOT attack if card is NOT in opponent zone", () => {
    const capability = createCapability({
      card: { isInHomeZone: () => true },
    });

    expect(capability.canDoIt()).toBe(false);
  });

  test("Player can NOT attack if there are no available targets", () => {
    const capability = createCapability({
      card: { isInHomeZone: () => false },
      opponentStateService: {
        getMatchingBehaviourCards: () => [],
      },
    });

    expect(capability.canDoIt()).toBe(false);
  });
});

describe("doIt", () => {
  test("Should emit attack for first matching target", () => {
    const matchController = { emit: jest.fn() };
    const targets = [{ id: "C2A" }, { id: "C3A" }];
    const capability = createCapability({
      card: { id: "C1A" },
      opponentStateService: {
        getMatchingBehaviourCards: () => targets,
      },
      matchController,
    });

    capability.doIt();

    expect(matchController.emit).toBeCalledWith("attack", {
      attackerCardId: "C1A",
      defenderCardId: "C2A",
    });
  });
});

function createCapability(options = {}) {
  return Capability({
    card: { isInHomeZone: () => false },
    opponentStateService: {
      getMatchingBehaviourCards: () => [],
    },
    ...options,
  });
}

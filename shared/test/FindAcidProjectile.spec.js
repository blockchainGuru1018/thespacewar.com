const FindAcidProjectile = require("../match/commander/FindAcidProjectile");
const Commander = require("../match/commander/Commander");

describe("Can Use Find Acid Projectile", () => {
  it("should be able to use when have 2 action points or more and commander is Staux", () => {
    const triggerCommanderDormantEffect = new FindAcidProjectile({
      playerPhase: {
        isAction: () => true,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.Staux,
        getEvents: () => [],
      },
      playerActionPointsCalculator: {
        calculate: () => 2,
      },
    });

    expect(
      triggerCommanderDormantEffect.canIssueFindAcidProjectile()
    ).toBeTruthy();
  });

  it("should no be able to use when not playing Staux", () => {
    const triggerCommanderDormantEffect = new FindAcidProjectile({
      playerPhase: {
        isAction: () => true,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.DrStein,
        getEvents: () => [],
      },
      playerActionPointsCalculator: {
        calculate: () => 2,
      },
    });

    expect(
      triggerCommanderDormantEffect.canIssueFindAcidProjectile()
    ).toBeFalsy();
  });

  it("should no be able to use when cannot afford it", () => {
    const triggerCommanderDormantEffect = new FindAcidProjectile({
      playerPhase: {
        isAction: () => true,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.Staux,
        getEvents: () => [],
      },
      playerActionPointsCalculator: {
        calculate: () => 1,
      },
    });

    expect(
      triggerCommanderDormantEffect.canIssueFindAcidProjectile()
    ).toBeFalsy();
  });

  it("should no be able to use when is not action phase", () => {
    const triggerCommanderDormantEffect = new FindAcidProjectile({
      playerPhase: {
        isAction: () => false,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.Staux,
        getEvents: () => [],
      },
      playerActionPointsCalculator: {
        calculate: () => 2,
      },
    });

    expect(
      triggerCommanderDormantEffect.canIssueFindAcidProjectile()
    ).toBeFalsy();
  });
});

describe("Using Find Acid Projectile", () => {
  it("should be able to use when have 2 action points or more and commander is Staux", () => {
    const triggerCommanderDormantEffect = new FindAcidProjectile({
      playerPhase: {
        isAction: () => true,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.Staux,
        getEvents: () => [],
      },
      playerActionPointsCalculator: {
        calculate: () => 2,
      },
    });

    expect(
      triggerCommanderDormantEffect.canIssueFindAcidProjectile()
    ).toBeTruthy();
  });
});

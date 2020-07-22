const FindAcidMissile = require("../match/commander/FindAcidMissile");
const Commander = require("../match/commander/Commander");

describe("Can Use Find Acid Missile", () => {
  it("should be able to use when have 2 action points or more and commander is Staux", () => {
    const triggerCommanderDormantEffect = new FindAcidMissile({
      playerPhase: {
        isAction: () => true,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.Staux,
      },
      playerActionPointsCalculator: {
        calculate: () => 2,
      },
    });

    expect(
      triggerCommanderDormantEffect.canIssueFindAcidMissile()
    ).toBeTruthy();
  });

  it("should no be able to use when not playing Staux", () => {
    const triggerCommanderDormantEffect = new FindAcidMissile({
      playerPhase: {
        isAction: () => true,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.DrStein,
      },
      playerActionPointsCalculator: {
        calculate: () => 2,
      },
    });

    expect(triggerCommanderDormantEffect.canIssueFindAcidMissile()).toBeFalsy();
  });

  it("should no be able to use when cannot afford it", () => {
    const triggerCommanderDormantEffect = new FindAcidMissile({
      playerPhase: {
        isAction: () => true,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.Staux,
      },
      playerActionPointsCalculator: {
        calculate: () => 1,
      },
    });

    expect(triggerCommanderDormantEffect.canIssueFindAcidMissile()).toBeFalsy();
  });

  it("should no be able to use when is not action phase", () => {
    const triggerCommanderDormantEffect = new FindAcidMissile({
      playerPhase: {
        isAction: () => false,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.Staux,
      },
      playerActionPointsCalculator: {
        calculate: () => 2,
      },
    });

    expect(triggerCommanderDormantEffect.canIssueFindAcidMissile()).toBeFalsy();
  });
});

describe("Using Find Acid Missile", () => {
  it("should be able to use when have 2 action points or more and commander is Staux", () => {
    const triggerCommanderDormantEffect = new FindAcidMissile({
      playerPhase: {
        isAction: () => true,
      },
      playerStateService: {
        getCurrentCommander: () => Commander.Staux,
      },
      playerActionPointsCalculator: {
        calculate: () => 2,
      },
    });

    expect(
      triggerCommanderDormantEffect.canIssueFindAcidMissile()
    ).toBeTruthy();
  });
});

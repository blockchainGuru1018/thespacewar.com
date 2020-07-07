const LookAtStationRow = require("../match/card/actions/LookAtStationRow.js");

describe("can only look at handSize station row cards when a card has that ability", () => {
  test("a card has ability", () => {
    const card = {};
    const action = LookAtStationRow({
      cardsThatCanLookAtHandSizeStationRow: () => [card],
    });
    expect(action.canDoIt()).toBe(true);
  });
  test("NO card has ability", () => {
    const action = LookAtStationRow({
      cardsThatCanLookAtHandSizeStationRow: () => [],
    });
    expect(action.canDoIt()).toBe(false);
  });
});

describe("when asking if specific card can do it...", () => {
  test("card has ability", () => {
    const action = LookAtStationRow({
      cardCanLookAtHandSizeStationRow: (cardId) => cardId === "C1A",
    });
    expect(action.cardCanDoIt("C1A")).toBe(true);
  });
  test("card does NOT have ability", () => {
    const action = LookAtStationRow({
      cardCanLookAtHandSizeStationRow: () => false,
    });
    expect(action.cardCanDoIt("C1A")).toBe(false);
  });
});

describe("add requirement when look at handSize station row", () => {
  test("card has requirement and stationRow is handSize", () => {
    const spec = "SPEC";
    const card = {
      info: { requirementSpecsWhenLookAtHandSizeStationRow: spec },
    };
    const addRequirementFromSpec = { forCardAndSpec: jest.fn() };
    const action = createAction({ addRequirementFromSpec });

    action.doIt(card, "handSize");

    expect(addRequirementFromSpec.forCardAndSpec).toBeCalledWith(card, spec);
  });
  test("stationRow is NOT hand size, do NOT do anything", () => {
    const spec = "SPEC";
    const card = {
      info: { requirementSpecsWhenLookAtHandSizeStationRow: spec },
    };
    const addRequirementFromSpec = { forCardAndSpec: jest.fn() };
    const action = createAction({ addRequirementFromSpec });

    action.doIt(card, "action");

    expect(addRequirementFromSpec.forCardAndSpec).not.toBeCalled();
  });
  test("when can NOT add requirement", () => {
    const spec = "SPEC";
    const card = {
      info: { requirementSpecsWhenLookAtHandSizeStationRow: spec },
    };
    const addRequirementFromSpec = { forCardAndSpec: jest.fn() };
    const canAddRequirementFromSpec = {
      forCardWithSpecAndTarget: () => false,
    };
    const action = createAction({
      addRequirementFromSpec,
      canAddRequirementFromSpec,
    });

    action.doIt(card, "handSize");

    expect(addRequirementFromSpec.forCardAndSpec).not.toBeCalled();
  });
});

function createAction(options = {}) {
  return LookAtStationRow({
    canAddRequirementFromSpec: {
      forCardWithSpecAndTarget: () => true,
    },
    ...options,
  });
}

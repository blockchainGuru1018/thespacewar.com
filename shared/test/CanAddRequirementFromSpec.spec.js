const CanAddRequirementFromSpec = require("../match/requirement/CanAddRequirementFromSpec.js");

test('when requirement spec has an "onlyWhen" condition for opponent whose action returns false, can NOT add requirement', () => {
  const onlyWhenStub = () => false;
  const canAddRequirementFromSpec = setupClassWithRequirementConditions(
    requirementConditions(onlyWhenStub)
  );
  const spec = withSpecForOpponent({
    onlyWhen: "targetIsFlippedStationCard",
  });
  const target = "C1A";

  const result = canAddRequirementFromSpec.forCardWithSpecAndTarget(
    {},
    spec,
    target
  );

  expect(result).toBe(false);
});

test('when checking "onlyWhen" condition for OPPONENT should provide condition name and target data', () => {
  const onlyWhenStub = jest.fn();
  const canAddRequirementFromSpec = setupClassWithRequirementConditions(
    requirementConditions(onlyWhenStub)
  );
  const specForOpponent = { onlyWhen: "targetIsFlippedStationCard" };
  const spec = withSpecForOpponent(specForOpponent);
  const target = "C2A";
  const card = { id: "C1A" };

  canAddRequirementFromSpec.forCardWithSpecAndTarget(card, spec, target);

  expect(onlyWhenStub).toBeCalledWith("targetIsFlippedStationCard", {
    card,
    target,
    specForPlayer: specForOpponent,
  });
});

test('when requirement spec has an "onlyWhen" condition for player whose action returns false, can NOT add requirement', () => {
  const onlyWhenStub = () => false;
  const canAddRequirementFromSpec = setupClassWithRequirementConditions(
    requirementConditions(onlyWhenStub)
  );
  const spec = withSpecForPlayer({ onlyWhen: "targetIsFlippedStationCard" });
  const target = "C1A";

  const result = canAddRequirementFromSpec.forCardWithSpecAndTarget(
    {},
    spec,
    target
  );

  expect(result).toBe(false);
});

test('when checking "onlyWhen" condition for PLAYER should provide condition name and target data', () => {
  const onlyWhenStub = jest.fn();
  const canAddRequirementFromSpec = setupClassWithRequirementConditions(
    requirementConditions(onlyWhenStub)
  );
  const specForPlayer = { onlyWhen: "targetIsFlippedStationCard" };
  const spec = withSpecForPlayer(specForPlayer);
  const target = "C2A";
  const card = { id: "C1A" };

  canAddRequirementFromSpec.forCardWithSpecAndTarget(card, spec, target);

  expect(onlyWhenStub).toBeCalledWith("targetIsFlippedStationCard", {
    card,
    target,
    specForPlayer,
  });
});

test('when has NO "onlyWhen" condition should NOT try to run condition', () => {
  const onlyWhenStub = jest.fn();
  const canAddRequirementFromSpec = setupClassWithRequirementConditions(
    requirementConditions(onlyWhenStub)
  );
  const specForPlayer = {};
  const spec = withSpecForPlayer(specForPlayer);
  const target = "C2A";
  const card = { id: "C1A" };

  canAddRequirementFromSpec.forCardWithSpecAndTarget(card, spec, target);

  expect(onlyWhenStub).not.toBeCalled();
});

test('when has NO "onlyWhen" condition should be able to add requirement', () => {
  const onlyWhenStub = jest.fn();
  const canAddRequirementFromSpec = setupClassWithRequirementConditions(
    requirementConditions(onlyWhenStub)
  );
  const specForPlayer = {};
  const spec = withSpecForPlayer(specForPlayer);
  const target = "C2A";
  const card = { id: "C1A" };

  const result = canAddRequirementFromSpec.forCardWithSpecAndTarget(
    card,
    spec,
    target
  );

  expect(result).toBe(true);
});

test("when spec has no special condition can add requirement", () => {
  const canAddRequirementFromSpec = CanAddRequirementFromSpec({});
  expect(
    canAddRequirementFromSpec.forCardPutDownInHomeZone({}, { forOpponent: [] })
  ).toBe(true);
});

function setupClassWithRequirementConditions(requirementConditions) {
  return CanAddRequirementFromSpec({ requirementConditions });
}

function requirementConditions(onlyWhenStub) {
  return {
    onlyWhen: onlyWhenStub,
  };
}

function withSpecForPlayer(spec) {
  return {
    forOpponent: [],
    forPlayer: [spec],
  };
}

function withSpecForOpponent(spec) {
  return {
    forOpponent: [spec],
    forPlayer: [],
  };
}

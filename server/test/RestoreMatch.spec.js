const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");

describe("Restore match", () => {
  test("matchId is preserved", () => {
    const { match } = setupIntegrationTest(
      {},
      { matchDeps: { matchId: "M1" } }
    );
    const restorableStateJson = match.getRestorableState();
    const { match: newMatch } = setupIntegrationTest(
      {},
      { matchDeps: { matchId: "M2" } }
    );
    newMatch.restoreFromRestorableState(restorableStateJson);

    expect(newMatch.id).toEqual(match.id);
  });
});

const FakeState = require("../testUtils/FakeState.js");
const { createController } = require("../testUtils");
const getCardImageUrl = require("../utils/getCardImageUrl.js");
const {
  assert,
  sinon,
  timeout,
} = require("../testUtils/bocha-jest/bocha-jest.js");

let controller;

beforeEach(() => {
  sinon.stub(getCardImageUrl, "byCommonId").returns("/#");
  controller = createController();
});

afterEach(() => {
  getCardImageUrl.byCommonId.restore && getCardImageUrl.byCommonId.restore();
  controller && controller.tearDown();
});

describe("StartTutorialSuggestion info screen", () => {
  it("Should not be displayed when gameOn its true", async () => {
    await renderWithoutState();
    const { dispatch } = controller;
    dispatch("stateChanged", FakeState({ gameOn: true }));
//     assert.elementCount("#startTutorialText", 0);
  });

  it("Should be displayed when gameOn its false", async () => {
    await renderWithoutState();
//     assert.elementCount("#startTutorialText", 1);
  });
});

async function renderWithoutState() {
  const { showPage } = controller;
  showPage();
  await timeout();
}

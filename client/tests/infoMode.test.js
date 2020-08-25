import TutorialSteps from "../match/infoMode/tutorial/TutorialSteps.js";

const getCardImageUrl = require("../utils/getCardImageUrl.js");
const FakeState = require("../testUtils/FakeState.js");
const { createController } = require("../testUtils");
const {
  assert,
  refute,
  sinon,
  timeout,
  dom: { click },
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

test("should show toggle info mode button", async () => {
  await renderWithState({});
  assert.elementCount(".toggleInfoMode", 1);
});

test("when toggle info mode should show first step in tutorial", async () => {
  await toggleInfoMode();
  assert.elementCount(".infoMode", 1);
  assert.elementCount('[t-id="infoMode-step0"]', 1);
});

// test("when toggle info mode should collapse action log", async () => {
//   await renderWithState({
//     actionLogEntries: [{ action: "played", text: "" }],
//   });

//   await click(".toggleInfoMode");

//   assert.elementHasClass(".actionLog" /*, "actionLog--collapsed"*/);
// });

test("when in info mode and click toggle button again should hide tutorial", async () => {
  await toggleInfoMode();

  await click(".toggleInfoMode");

  assert.elementCount(".infoMode", 0);
  assert.elementCount('[t-id="infoMode-step0"]', 0);
});

test("when click anywhere in tutorial should go to the next slide", async () => {
  await toggleInfoMode();

  await click(".infoMode");

  assert.elementCount('[t-id="infoMode-step0"]', 0);
  assert.elementCount('[t-id="infoMode-step1"]', 1);
});

test("when have progressed in the tutorial and click the toggle twice should show the tutorial again but at the first step", async () => {
  await toggleInfoMode();
  await click(".infoMode");

  await click(".toggleInfoMode");
  await click(".toggleInfoMode");

  assert.elementCount('[t-id="infoMode-step0"]', 1);
  assert.elementCount('[t-id="infoMode-step1"]', 0);
});

test("when go to last slide in tutorial and click anywhere should hide tutorial", async () => {
  await toggleInfoMode();

  const amountOfStepsInTutorial = TutorialSteps.InOrder.length;
  await clickTimes(".infoMode", amountOfStepsInTutorial);

  assert.elementCount(".infoMode", 0);
});

// test("when finishes tutorial should expand action log", async () => {
//   await toggleInfoMode();

//   const amountOfStepsInTutorial = TutorialSteps.InOrder.length;
//   await clickTimes(".infoMode", amountOfStepsInTutorial);

//   refute.elementHasClass(
//     ".actionLog",
//     "actionLog--collapsed",
//     "Action log is NOT expanded"
//   );
// });

async function toggleInfoMode() {
  await renderWithState({});
  await click(".toggleInfoMode");
}

async function renderWithState(state) {
  const { dispatch, showPage } = controller;
  showPage();
  dispatch("stateChanged", FakeState(state));
  await timeout();
}

async function clickTimes(selector, times) {
  for (let i = 0; i < times; i++) {
    await click(selector);
  }
}

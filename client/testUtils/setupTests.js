const { setupFakeLeaderLine } = require("./fakeLeaderLine.js");
const jsdomDevtoolsFormatter = require("jsdom-devtools-formatter");

jsdomDevtoolsFormatter.install();

const isBrowserEnvironment = !!global.window;
if (isBrowserEnvironment) {
  setupFakeLeaderLine();
  window.runningInTestHarness = true;
}

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}

  observe() {
    return null;
  }

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }
};

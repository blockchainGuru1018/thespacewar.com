const {setupFakeLeaderLine} = require('./fakeLeaderLine.js');
const jsdomDevtoolsFormatter = require('jsdom-devtools-formatter');

jsdomDevtoolsFormatter.install();

const isBrowserEnvironment = !!global.window;
if (isBrowserEnvironment) {
    setupFakeLeaderLine();
    window.runningInTestHarness = true;
}

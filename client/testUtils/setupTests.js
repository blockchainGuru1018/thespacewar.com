const { setupFakeLeaderLine } = require('./fakeLeaderLine.js');
const jsdomDevtoolsFormatter = require('jsdom-devtools-formatter');

jsdomDevtoolsFormatter.install();
setupFakeLeaderLine();

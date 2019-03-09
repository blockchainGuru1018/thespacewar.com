const MatchTestController = require('./MatchTestController.js');

module.exports = {
    createControllerBoundToTestContext: testContext => createController.bind(testContext)
}

function createController(options = {}) {
    this.controller = MatchTestController(options);
    return { dispatch: this.controller.dispatch };
}
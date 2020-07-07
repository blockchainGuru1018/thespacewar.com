const defaults = require("lodash/defaults");

module.exports = function FakeMatchController(options = {}, testOptions) {
    return defaults(options, {
        start() {},
        emit: (testOptions && testOptions.stub) || getSinonStub(),
        stop() {},
    });
};

function getSinonStub() {
    return require("./bocha-jest/bocha-jest.js").stub();
}

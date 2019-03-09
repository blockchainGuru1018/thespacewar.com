const defaults = require('lodash/defaults');
const {
    stub
} = require('../bocha-jest/bocha-jest.js');

module.exports = function FakeMatchController(options = {}) {
    return defaults(options, {
        start() {
        },
        emit: stub(),
        stop() { }
    });
}
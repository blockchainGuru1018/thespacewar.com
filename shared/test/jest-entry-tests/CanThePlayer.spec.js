const {
    toJestTest
} = require('../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../CanThePlayer.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

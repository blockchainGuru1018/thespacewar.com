const {
    toJestTest
} = require('../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../Cards.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

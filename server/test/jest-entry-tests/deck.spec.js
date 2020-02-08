const {
    toJestTest
} = require('../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../deck/deck.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

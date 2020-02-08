const {
    toJestTest
} = require('../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../legacy/QueryAttacks.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

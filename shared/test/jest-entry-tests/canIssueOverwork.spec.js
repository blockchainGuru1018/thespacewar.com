const {
    toJestTest
} = require('../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../legacy/canIssueOverwork.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

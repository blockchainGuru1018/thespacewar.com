const {
    toJestTest
} = require('../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../legacy/PlayerRuleService.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

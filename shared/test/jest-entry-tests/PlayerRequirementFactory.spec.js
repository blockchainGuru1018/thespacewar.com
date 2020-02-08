const {
    toJestTest
} = require('../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../legacy/PlayerRequirementFactory.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

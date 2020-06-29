const {
    toJestTest
} = require('../../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../match/ActionPointCalculator.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

const {
    toJestTest
} = require('../../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../QueryAttacks.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

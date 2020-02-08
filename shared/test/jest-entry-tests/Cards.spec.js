const {
    toJestTest
} = require('../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../legacy/Cards.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

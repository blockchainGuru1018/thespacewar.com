const {
    toJestTest
} = require('../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../legacy/CanCounterCardsWithCostOrLess.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

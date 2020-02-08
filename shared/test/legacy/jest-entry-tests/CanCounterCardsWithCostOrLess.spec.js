const {
    toJestTest
} = require('../../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../CanCounterCardsWithCostOrLess.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

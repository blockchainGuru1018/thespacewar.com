const {
    toJestTest
} = require('../../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../CardEffect.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

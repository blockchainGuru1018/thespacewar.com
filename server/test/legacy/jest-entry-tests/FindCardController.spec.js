const {
    toJestTest
} = require('../../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../controller/FindCardController.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

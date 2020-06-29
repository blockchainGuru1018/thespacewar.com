const {
    toJestTest
} = require('../../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../SourceFetcher.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

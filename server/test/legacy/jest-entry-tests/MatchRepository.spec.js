const {
    toJestTest
} = require('../../testUtils/bocha-jest/bocha-jest.js');
const suite = require('../match/MatchRepository.tests.js');

const jestSuite = toJestTest(suite);
jestSuite();

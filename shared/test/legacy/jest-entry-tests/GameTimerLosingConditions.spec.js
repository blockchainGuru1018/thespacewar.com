const { toJestTest } = require("../../testUtils/bocha-jest/bocha-jest.js");
const suite = require("../GameTimerLosingConditions.tests.js");

const jestSuite = toJestTest(suite);
jestSuite();

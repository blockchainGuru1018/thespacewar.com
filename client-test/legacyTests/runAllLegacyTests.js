const initVueAndPlugins = require('../matchTestUtils/initVueAndPlugins.js');
const { toJestTest } = require('../bocha-jest/bocha-jest.js');
const mainSuite = require('./mainSuite.js');

initVueAndPlugins();

let jestMainSuite = toJestTest(mainSuite);
jestMainSuite();
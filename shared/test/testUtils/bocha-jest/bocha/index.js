const sinon = require("sinon");
require("./lib/addLegacyMethodsToSinon.js")(sinon);
const assert = require("./lib/assert.js");
const refute = require("./lib/refute.js");
const timeoutPromise = require("./lib/timeoutPromise.js");
const fakeClock = require("./lib/fakeClock.js");
const defaults = require("lodash.defaults");
const defaultsDeep = require("lodash.defaultsdeep");

module.exports = {
  assert: assert,
  refute: refute,
  sinon: sinon,
  stub: sinon.stub,
  fakeClock: fakeClock,
  timeoutPromise: timeoutPromise,
  defaults: defaults,
  defaultsDeep: defaultsDeep,
};

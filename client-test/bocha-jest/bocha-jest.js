let assert = require('bocha/lib/dom/assert.js');
let refute = require('bocha/lib/dom/refute.js');
let timeout = require('bocha/lib/timeoutPromise.js');
let bochaDom = require('bocha/lib/dom/dom.js');
let defaults = require('lodash/defaults');
let sinon = require('sinon');
let stub = sinon.stub;
let click = bochaDom.clickAndTick;
let toJestTest = require('./toJestTest.js');

module.exports = {
    dom: {
        click
    },
    stub,
    sinon,
    timeout,
    refute,
    assert,
    toJestTest,
    defaults
}
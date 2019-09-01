let assert = require('bocha/lib/dom/assert.js');
let refute = require('bocha/lib/dom/refute.js');
let timeout = require('bocha/lib/timeoutPromise.js');
let bochaDom = require('bocha/lib/dom/dom.js');
let fakeClock = require('bocha/lib/fakeClock.js');
let defaults = require('lodash/defaults');
let sinon = require('sinon');
let stub = sinon.stub;
let click = bochaDom.clickAndTick;
let toJestTest = require('./toJestTest.js');
const nodeAssert = require('assert');

assert.elementTextStartsWith = function (selector, text) {
    const element = document.querySelector(selector);
    if(!element) throw new Error('Cannot find element with selector: ' + selector);

    const startsWithText = element.textContent.trim().startsWith(text);
    nodeAssert.ok(startsWithText, `Element "${selector}" should start with text "${text}" but has text ${element.textContent}`);
};

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
    defaults,
    fakeClock
};

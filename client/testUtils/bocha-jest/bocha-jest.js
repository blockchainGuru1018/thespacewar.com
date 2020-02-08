const assert = require('./bocha/lib/dom/assert.js');
const refute = require('./bocha/lib/dom/refute.js');
const timeout = require('./bocha/lib/timeoutPromise.js');
const bochaDom = require('./bocha/lib/dom/dom.js');
const fakeClock = require('./bocha/lib/fakeClock.js');
const defaults = require('lodash/defaults');
const sinon = require('sinon');
const stub = sinon.stub;
const click = bochaDom.clickAndTick;
const toJestTest = require('./toJestTest.js');
const nodeAssert = require('assert');

assert.elementTextStartsWith = function (selector, text) {
    const element = document.querySelector(selector);
    if (!element) throw new Error('Cannot find element with selector: ' + selector);

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

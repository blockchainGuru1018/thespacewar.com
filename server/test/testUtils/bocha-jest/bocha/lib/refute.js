var sinon = require('sinon');
var _assert = require('assert');
var utils = require('./utils.js');

module.exports = refute;

function refute(value, message) {
    if (value) {
        _assert.fail(value, false, message, '==', refute);
    }
}

refute.equals = function (actual, expected, message) {
    if (utils.deepEqual(actual, expected)) {
        _assert.fail(actual, expected, message, 'equals', refute.equals);
    }
};

refute.same = function (actual, expected) {
    _assert.notStrictEqual(actual, expected);
};

refute.defined = function (value, message) {
    if (typeof value !== 'undefined') {
        _assert.fail(value, undefined, message, 'defined', refute.defined);
    }
};

refute.startsWith = function (actual, expected, message) {
    if (actual.startsWith(expected)) {
        _assert.fail(actual, expected, message, 'startsWith');
    }
};

refute.endsWith = function (actual, expected, message) {
    if (actual.endsWith(expected)) {
        _assert.fail(actual, expected, message, 'endsWith');
    }
};

refute.called = sinon.assert.notCalled;
refute.calledOnce = function (stub) {
    _assert.notEqual(stub.callCount, 1);
};
refute.calledTwice = function (stub) {
    _assert.notEqual(stub.callCount, 2);
};
refute.calledThrice = function (stub) {
    _assert.notEqual(stub.callCount, 3);
};
refute.calledWith = sinon.assert.neverCalledWith;
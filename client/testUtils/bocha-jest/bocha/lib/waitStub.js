'use strict';
// WORKAROUND: Needed since there can sometimes be >1000 process.nextTick() without leaving the event-loop,
// depending on how the tests are scheduled. This is not likely to ever happen in production.
process.maxTickDepth = 10000;

let sinon = require('sinon');

addWaitMethodToSinonSpyAndStub();

module.exports = function (stub, callback) {
    if (callback) {
        return waitForCall(stub, 1)(callback);
    }
    else {
        let promise = waitForCallPromise(stub, 1)();
        return Object.assign(promise, {
            first: waitForCall(stub, 1),
            second: waitForCall(stub, 2),
            third: waitForCall(stub, 3),
            forth: waitForCall(stub, 4),
            call: function (stub) {
                return function (x, cb) {
                    return waitForCall(stub, x + 1)(cb);
                }
            }
        });
    }
};

function waitForCall(stub, targetCallCount) {
    return function (callback) {
        if (stub.callCount >= targetCallCount) {
            let args = stub.getCall(targetCallCount - 1).args;
            callback.apply(null, args);
        }
        else {
            stub.waitForCall(callback, targetCallCount);
        }
    };
}

function waitForCallPromise(stub, targetCallCount) {
    return function () {
        return new Promise(resolve => {
            if (stub.callCount >= targetCallCount) {
                let args = stub.getCall(targetCallCount - 1).args;
                resolve(args.length === 1 ? args[0] : args);
            }
            else {
                stub.waitForCall(() => {
                    let args = stub.getCall(targetCallCount - 1).args;
                    resolve(args.length === 1 ? args[0] : args);
                }, targetCallCount);
            }
        });
    };
}

function addWaitMethodToSinonSpyAndStub() {
    let originalCreate = sinon.spy;
    sinon.spy = function () {
        let stub = originalCreate.apply(null, Array.prototype.slice.call(arguments));
        return addWaitForCallToStub(stub);
    };
    let originalStub = sinon.stub;
    sinon.stub = function () {
        let stub = originalStub.apply(null, Array.prototype.slice.call(arguments));
        return addWaitForCallToStub(stub);
    };
}

function addWaitForCallToStub(stub) {
    let listenerMap = {};
    stub.waitForCall = function (listener, targetCallCount) {
        let list = listenerMap[targetCallCount];
        if (!list) {
            list = [];
            listenerMap[targetCallCount] = list;
        }

        list.push(listener);
    };

    let originalInvoke = stub.invoke;
    let callCount = 0;
    stub.invoke = function invoke(func, thisValue, args) {
        callCount++;
        let result = originalInvoke.call(stub, func, thisValue, args);

        let listeners = listenerMap[callCount];
        if (listeners) {
            listeners.forEach(listener => {
                listener.apply(thisValue, args);
            });
        }

        return result;
    };
    return stub;
}
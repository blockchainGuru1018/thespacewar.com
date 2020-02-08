module.exports = function (sinon) {
    let originalStub = sinon.stub;
    sinon.stub = function () {
        if (arguments.length === 3 && typeof arguments[1] === 'string' && typeof arguments[2] === 'function') {
            return originalStub(arguments[0], arguments[1]).callsFake(arguments[2]);
        }
        else {
            return originalStub.apply(null, Array.prototype.slice.call(arguments));
        }
    };

    let originalFakeTimers = sinon.useFakeTimers;
    sinon.useFakeTimers = function () {
        if (arguments.length === 2 && arguments[1] === "Date") {
            return sinon.useFakeTimers({
                now: arguments[0],
                toFake: ["Date"]
            });
        }
        else {
            return originalFakeTimers.apply(null, Array.prototype.slice.call(arguments));
        }
    };
};
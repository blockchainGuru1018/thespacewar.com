module.exports = timeoutPromise;

function timeoutPromise(args1, args2) {
    var clock;
    var time;
    if (args1 && args1.tick) {
        clock = args1;
        time = args2 || 0;
    } else {
        time = args1 || 0;
    }
    var chain = Promise.resolve();
    if (clock) {
        chain = chain.then(function () {
            clock.tick(time);
            return Promise.resolve();
        });
    } else {
        chain = chain.then(function () {
            return new Promise(function (resolve) {
                setTimeout(resolve, time);
            });
        });
    }
    for (var i = 0; i < 19; i++) {
        chain = chain.then(function () {
            return Promise.resolve();
        });
    }
    if (!clock) {
        chain = chain.then(function () {
            return new Promise(function (resolve) {
                setTimeout(resolve);
            });
        });
    }
    return chain;
}

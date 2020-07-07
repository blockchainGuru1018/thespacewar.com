const methods = {
    describe,
    test,
    beforeEach,
    afterEach,
};

module.exports = function (bochaTests) {
    const testContext = {};

    const testTree = createTraversableTreeFromBochaTests(bochaTests);
    const tests = createFinalJestTests(testTree);

    return () => runTests(tests);

    function createFinalJestTests(stack, depth = 0) {
        const callbacks = [];
        while (stack.length > 0) {
            let piece = stack.pop();

            if (piece.method === "beforeEach" || piece.method === "afterEach") {
                callbacks.push(function () {
                    methods[piece.method](piece.fn);
                });
            } else if (piece.method === "describe") {
                const subCallbacks = createFinalJestTests(
                    piece.stack,
                    depth + 1
                );
                if (piece.name.startsWith("=>")) {
                    callbacks.push(function () {
                        methods[piece.method].only(piece.name, function () {
                            for (const subCallback of subCallbacks) {
                                subCallback();
                            }
                        });
                    });
                } else {
                    callbacks.push(function () {
                        methods[piece.method](piece.name, function () {
                            for (const subCallback of subCallbacks) {
                                subCallback();
                            }
                        });
                    });
                }
            } else if (piece.method === "test") {
                while (piece && piece.method === "test") {
                    const pieceToUse = piece;
                    if (piece.name.startsWith("=>")) {
                        callbacks.push(function () {
                            methods[pieceToUse.method].only(
                                pieceToUse.name,
                                pieceToUse.fn
                            );
                        });
                    } else {
                        callbacks.push(function () {
                            methods[pieceToUse.method](
                                pieceToUse.name,
                                pieceToUse.fn
                            );
                        });
                    }

                    piece = stack.pop();
                }
            }
        }

        return callbacks;
    }

    function createTraversableTreeFromBochaTests(config) {
        const stack = [];

        for (const key of Object.keys(config)) {
            if (key === "setUp") {
                stack.push({
                    method: "beforeEach",
                    fn: config[key].bind(testContext),
                });
            } else if (key === "tearDown") {
                stack.push({
                    method: "afterEach",
                    fn: config[key].bind(testContext),
                });
            } else {
                if (typeof config[key] === "object") {
                    const subStack = createTraversableTreeFromBochaTests(
                        config[key]
                    );
                    stack.push({
                        method: "describe",
                        name: key,
                        stack: subStack,
                    });
                } else if (typeof config[key] === "function") {
                    stack.push({
                        method: "test",
                        name: key,
                        fn: config[key].bind(testContext),
                    });
                }
            }
        }

        return stack.reverse();
    }

    function runTests(jestTestCallbacks) {
        for (const callback of jestTestCallbacks) {
            callback();
        }
    }
};

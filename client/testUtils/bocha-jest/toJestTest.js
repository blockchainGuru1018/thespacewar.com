let methods = {
    describe,
    test,
    beforeEach,
    afterEach
};

module.exports = function (bochaTests) {

    let testContext = {};

    let testTree = createTraversableTreeFromBochaTests(bochaTests);
    let tests = createFinalJestTests(testTree);
    
    return () => runTests(tests);
    
    function createFinalJestTests(stack, depth = 0) {
        let callbacks = [];
        while (stack.length > 0) {
            let piece = stack.pop();

            if (piece.method === 'beforeEach' || piece.method === 'afterEach') {
                callbacks.push(function () {
                    methods[piece.method](piece.fn);
                });
            }
            else if (piece.method === 'describe') {
                let subCallbacks = createFinalJestTests(piece.stack, depth + 1);
                if (piece.name.startsWith('=>')) {
                    callbacks.push(function () {
                        methods[piece.method].only(piece.name, function () {
                            for (let subCallback of subCallbacks) {
                                subCallback();
                            }
                        });
                    });
                }
                else {
                    callbacks.push(function () {
                        methods[piece.method](piece.name, function () {
                            for (let subCallback of subCallbacks) {
                                subCallback();
                            }
                        });
                    });
                }
            }
            else if (piece.method === 'test') {
                while (piece && piece.method === 'test') {
                    let pieceToUse = piece;
                    if (piece.name.startsWith('=>')) {
                        callbacks.push(function () {
                            methods[pieceToUse.method].only(pieceToUse.name, pieceToUse.fn);
                        });
                    }
                    else {
                        callbacks.push(function () {
                            methods[pieceToUse.method](pieceToUse.name, pieceToUse.fn);
                        });
                    }

                    piece = stack.pop();
                }
            }
        }

        return callbacks;
    }

    function createTraversableTreeFromBochaTests(config) {
        let stack = [];

        for (let key of Object.keys(config)) {
            if (key === 'setUp') {
                stack.push({ method: 'beforeEach', fn: config[key].bind(testContext) });
            }
            else if (key === 'tearDown') {
                stack.push({ method: 'afterEach', fn: config[key].bind(testContext) });
            }
            else {
                if (typeof config[key] === 'object') {
                    let subStack = createTraversableTreeFromBochaTests(config[key]);
                    stack.push({
                        method: 'describe',
                        name: key,
                        stack: subStack
                    });
                }
                else if (typeof config[key] === 'function') {
                    stack.push({ method: 'test', name: key, fn: config[key].bind(testContext) });
                }
            }
        }

        return stack.reverse();
    }

    function runTests(jestTestCallbacks) {
        for(let callback of jestTestCallbacks) {
            callback();
        }
    }
}
let find = require('find');
let path = require('path');
let fs = require('fs');
let express = require('express');
let bochaRootPath = path.join(__dirname, '../../node_modules/bocha');
let testRootPath = path.join(__dirname, '../test');
let clientRootPath = path.join(__dirname, '../../');
let chokidar = require('chokidar');
let webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const REFRESH_POLLER_CONTENT = fs.readFileSync(path.join(__dirname, 'refreshPoller.js'));
const HTML_PREFIX = '/test-html/';
const WEBPACKIFY_PREFIX = '/webpackify/';
const LAST_CHANGE_PREFIX = '/last-change';
const QUERY_PREFIX = '/';
const PORT = 1337;

let lastChangeTime = Date.now();
let lastChangedTestFilePath;

let compiler;
let lastCompiledTestFilePath;
let lastCompiledBundleFilePath;
let lastCompiledExternals;

initWatcher();

express()
    .use(lastChangeMiddleware)
    .use(htmlMiddleware)
    .use(testScriptMiddleware)
    .use(autotestMiddleware)
    .use(express.static(bochaRootPath))
    .use(express.static(clientRootPath))
    .use(testScriptQueryMiddleware)
    .use((err, req, res, next) => { // 4 parameters required
        return res.status(500).send('<pre>' + err + '</pre>');
    })
    .listen(PORT);

console.log(`Listening on port ${PORT}`);
process.stdout.write('\x1b]0;Client Test Server\x07');

function lastChangeMiddleware(req, res, next) {
    if (req.url.indexOf(LAST_CHANGE_PREFIX) === 0) {
        res.json(lastChangeTime);
    }
    else {
        next();
    }
}

function htmlMiddleware(req, res, next) {
    if (req.url.indexOf(HTML_PREFIX) === 0) {
        let start = Date.now();
        let relativeUrl = req.url.substring(HTML_PREFIX.length);
        let testFilePath = path.join(testRootPath, relativeUrl + '.tests.js');
        log('BUILD START: ' + relativeUrl);
        ensureCompilerForTestFilePath(testFilePath);
        compiler.run((err, stats) => {
            if (err) return next(err);

            let timeString = `${Date.now() - start} ms elapsed`;

            let statsJson = stats.toJson();
            if (stats.hasErrors()) {
                logError(statsJson.errors);
                log(`BUILD COMPLETED WITH ERRORS - ${timeString}`);
            }
            else {
                log(`BUILD COMPLETED - ${timeString}`);
            }

            lastCompiledTestFilePath = testFilePath;
            lastCompiledBundleFilePath = path.join(require('os').tmpdir(), path.basename(testFilePath));

            let content = getPageContent({ req });
            res.send(content);
        });
    }
    else {
        next();
    }
}

function ensureCompilerForTestFilePath(testFilePath) {
    if (testFilePath !== lastCompiledTestFilePath) {
        let externalsUsed = {
            jquery: false,
            knockout: false,
            moment: false,
            vue: false,
            vuex: false,
        };
        let config = getWebpackConfig(testFilePath);
        compiler = webpack(config);
        compiler.plugin('normal-module-factory', nmf => {
            nmf.plugin('before-resolve', (result, callback) => {
                let request = result && result.request;
                if (request && request in externalsUsed) {
                    externalsUsed[request] = true;
                }
                callback(null, result);
            });
        });
        lastCompiledExternals = externalsUsed;
        lastCompiledTestFilePath = null;
        lastCompiledBundleFilePath = null;
    }
}

function getPageContent({ req }) {
    let htmlRelativeUrl = req.url.substring(HTML_PREFIX.length);
    let baseName = req.url.indexOf('.html') > 0 ? path.basename(req.url, '.html') : path.basename(req.url);
    let testRelativeUrl = path.join(path.dirname(htmlRelativeUrl), baseName + '.tests.js');
    let isAutoTest = req.autotest;

    let externals = lastCompiledExternals;
    return [
        '<!DOCTYPE HTML>',
        '<html>',
        '<head>',
        '<meta http-equiv="content-type" content="text/html; charset=utf-8">',
        '<title>' + htmlRelativeUrl + '</title>',
        '<link rel="stylesheet" type="text/css" href="/node_modules/mocha/mocha.css" />',
        `<style>
                html {                    
                    height: 100%;
                }
                body {                    
                    min-height: 300px;
                }
                #mocha-report {
                    background: #FFF;
                    padding: 10px 10px 20px 10px !important;
                    border-radius: 10px;
                }
                .body--fail {
                    background: #ffd7d7;
                }
                .body--success {
                    background: #dfffdf;
                }
             </style>`,
        '</head>',
        '<body>',
        '<div id="mocha"></div>',
        '<script src="/node_modules/babel-polyfill/dist/polyfill.min.js"></script>',
        '<script src="/node_modules/sinon/pkg/sinon.js"></script>',
        '<script src="/node_modules/mocha/mocha.js"></script>',
        isAutoTest ? `<script>(function() { var lastChangeTime = ${lastChangeTime}; ${REFRESH_POLLER_CONTENT} })();</script>` : '',
        '<script src="/webpackify/' + testRelativeUrl + '"></script>',
        `<script>
            (function () { 
                var runner = mocha.run();
                var failed = false;
                runner.on('fail', function () { 
                    failed = true; 
                    document.body.removeAttribute('style');
                    document.body.classList.add('body--fail');
                });
                runner.on('end', function () {
                    document.body.removeAttribute('style');
                    if (!failed) {
                        document.body.classList.add('body--success');
                    }
                });
             })();
             </script>`,
        '</body>'
    ].join('\n');
}

function autotestMiddleware(req, res, next) {
    if (req.url.indexOf('/autotest') === 0) {
        if (!lastChangedTestFilePath) {
            res.send(`
                <html>
                <body>
                <h1>Change a .tests.js file to start autotest</h1>
                <script>setTimeout(function() { window.location.reload(); }, 3000)</script>
                </body>
                </html>`);
            return;
        }

        req.autotest = true;
        req.url = '/test-html/' + path.relative(testRootPath, lastChangedTestFilePath).replace('.tests.js', '');
        htmlMiddleware(req, res, next);
    }
    else {
        next();
    }
}

function initWatcher() {
    let watcher = chokidar.watch(clientRootPath, {
        ignored: /node_modules/,
        ignoreInitial: true
    });
    watcher.on('all', (eventName, filePath) => {
        lastChangeTime = Date.now();
        if (/\.tests\.js$/.test(filePath)) {
            if (lastChangedTestFilePath !== filePath) {
                lastChangedTestFilePath = filePath;
            }
        }
    });
}

function testScriptQueryMiddleware(req, res, next) {
    console.log(QUERY_PREFIX);
    if (req.url.indexOf(QUERY_PREFIX) === 0) {
        let query = req.url.substr(QUERY_PREFIX.length).toLowerCase();

        find.file(/\.tests\.js$/, testRootPath, files => {
            let startMatches = files.filter(f => {
                let fileName = f.toLowerCase().split('/').slice(-1)[0];
                return fileName.indexOf(query) === 0;
            });
            let insideMatches = files.filter(f => {
                let fileName = f.toLowerCase().split('/').slice(-1)[0];
                return fileName.indexOf(query) > 0;
            });
            if (startMatches.length === 0 && insideMatches.length === 0) {
                res.end('No matches for: ' + query);
            }
            else if (startMatches.length === 1 && insideMatches.length === 0) {
                res.redirect('/test-html' + getRelativeUrlForTestFile(startMatches[0]));
            }
            else if (insideMatches.length === 1 && startMatches.length === 0) {
                res.redirect('/test-html' + getRelativeUrlForTestFile(insideMatches[0]));
            }
            else {
                let html = '<head><title>Test query: ' + query + '</title></head>';
                html += '<body style="padding: 50px; font-size: 20px">';
                html += getHtmlForMatches(startMatches);
                html += '<hr style="margin: 50px 0">';
                html += getHtmlForMatches(insideMatches);
                html += '</body>';

                res.type('html').end(html);
            }
        });
    }
    else {
        next();
    }
}

function getHtmlForMatches(matches) {
    return matches.map(f => {
        let relativeUrl = getRelativeUrlForTestFile(f);
        let text = relativeUrl.split('/').slice(1).join(' / ');
        let url = '/test-html' + relativeUrl;
        return '<div style="display:block;margin-bottom:10px">' +
            '<a href="' + url + '" style="text-decoration: none;color: blue;">' + text + '</a>' +
            '</div>';
    }).join('')
}

function getRelativeUrlForTestFile(testFile) {
    let relativeFilePath = testFile.substr(testRootPath.length);
    return relativeFilePath.replace(/\.tests\.js$/, '');
}

function testScriptMiddleware(req, res, next) {
    if (req.url.indexOf(WEBPACKIFY_PREFIX) === 0) {
        let relativeUrl = req.url.substring(WEBPACKIFY_PREFIX.length);
        let testFilePath = path.join(testRootPath, relativeUrl);

        if (testFilePath === lastCompiledTestFilePath) {
            res.sendFile(lastCompiledBundleFilePath);
        }
        else {
            res.end('Please try to run the test URL again');
        }
    }
    else {
        next();
    }
}

function logError(text) {
    console.error(new Date().toISOString() + ': ' + text);
}

function log(text) {
    console.log(new Date().toISOString() + ': ' + text);
}

function getWebpackConfig(filePath) {
    let filename = path.basename(filePath);
    return {
        entry: {
            [filename]: filePath
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    exclude: /node_modules/,
                    use: [
                        { loader: 'vue-loader', options: { esModule: false } }
                    ]
                },
                {
                    test: /\.jade$/,
                    exclude: /node_modules/,
                    use: [{ loader: 'jade-loader' }]
                },
                {
                    test: /\.js$/,
                    exclude: /(node_modules|\/client\/lib)/,
                    loader: 'babel-loader',
                    query: {
                        plugins: ['transform-object-rest-spread']
                    }
                },
                {
                    test: /\.scss$/,
                    use: [
                        'vue-style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                }
            ]
        },
        resolve: {
            modules: [
                path.join(__dirname, '../..', 'node_modules')
            ]
        },
        plugins: [
            new VueLoaderPlugin()
        ],
        externals: {
            mocha: 'mocha',
            sinon: 'sinon',
        },
        stats: 'errors-only',
        output: {
            path: require('os').tmpdir(),
            filename: filename
        },
        optimization: {
            minimize: false
        }
    };
}
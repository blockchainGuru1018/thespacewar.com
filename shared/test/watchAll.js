const path = require('path');
const bocha = require('bocha');

const srcPath = path.join(__dirname, '..');
bocha.watch({ fileSuffix: '.tests.js', srcPath, testPath: __dirname });
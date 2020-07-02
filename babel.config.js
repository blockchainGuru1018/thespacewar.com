// Jest has an issue picking up babel.config.js in sub-projects, therefore we have to define the babel config globally
const clientBabelConfig = require('./client/babel.config.js');

module.exports = clientBabelConfig;

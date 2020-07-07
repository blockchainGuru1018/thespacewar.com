const MatchTestController = require("./MatchTestController.js");
const initVueAndPlugins = require("./initVueAndPlugins.js");

initVueAndPlugins();

module.exports = {
    createController,
};

function createController(options = {}) {
    return MatchTestController(options);
}

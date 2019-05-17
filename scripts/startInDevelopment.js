const gameConfig = require('../shared/gameConfig.json');
const serverRelativePath = '../server/server.js';
let server = require(serverRelativePath);

init();

function init() {
    server.onRestart(onServerRestart);
    server.start({ inDevelopment: true, gameConfig });
}

async function onServerRestart() {
    await server.close();
    reloadServerModule();
    init();
}

function reloadServerModule() {
    for (let key of Object.keys(require.cache)) {
        delete require.cache[key];
    }
    server = require(serverRelativePath);
}

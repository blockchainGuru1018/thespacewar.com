const gameConfig = require('../shared/gameConfig.json');
const server = require('../server/server.js');

server.start({
    gameConfig,
    inDevelopment: false
});

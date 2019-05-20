const gameConfig = require('../shared/gameConfig.js');
const server = require('../server/server.js');

server.start({
    gameConfig,
    inDevelopment: false
});

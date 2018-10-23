const serverStarter = require('../../shared/serverStarter.js');

module.exports = function (deps) {

    const closeServer = deps.closeServer;
    const exitProcess = deps.exitProcess;

    return {
        onPush
    };

    async function onPush(req, res) {
        console.log('GitController: closing server');
        await closeServer();
        console.log('GitController: running start server script');
        serverStarter.installNpmPackages();
        serverStarter.startServer();

        res.end();

        exitProcess();
    }
};
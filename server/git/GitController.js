const serverStarter = require('../../shared/serverStarter.js');

const TIME_TO_PULL_GIT = 60 * 1000;

module.exports = function (deps) {

    const closeServer = deps.closeServer;
    const exitProcess = deps.exitProcess;

    return {
        onPush
    };

    async function onPush(req, res) {
        await wait(TIME_TO_PULL_GIT);

        console.log('GitController: closing server');
        await closeServer();
        console.log('GitController: running start server script');
        serverStarter.installNpmPackages();
        serverStarter.startServer();

        res.end();

        exitProcess();
    }
};

function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
const serverStarter = require("../../shared/serverStarter.js");

const TIME_TO_PULL_GIT = 60 * 1000;

module.exports = function (deps) {
  const closeServer = deps.closeServer;
  const exitProcess = deps.exitProcess;
  const matchRepository = deps.matchRepository;

  let currentRestartChecker;

  return {
    onPush,
  };

  async function onPush(req, res) {
    clearInterval(currentRestartChecker);
    res.end();

    await wait(TIME_TO_PULL_GIT);

    currentRestartChecker = setInterval(async () => {
      if (matchRepository.hasSomeMatchInProgress()) return;
      clearInterval(currentRestartChecker);

      console.info("GitController: closing server");
      await closeServer();
      console.info("GitController: running start server script");

      serverStarter.installNpmPackagesAndBuildProdClient();
      serverStarter.startServer();

      exitProcess();
    }, 10 * 1000);
  }
};

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

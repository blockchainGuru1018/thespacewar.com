const BotSpawner = require("./BotSpawner.js");
const ClientState = require("../state/ClientState.js");
const MatchControllerFactory = require("../match/MatchControllerFactory.js");

module.exports = function ({ socket, rawCardDataRepository }) {
  return {
    start,
  };

  function start({ matchId, playerUser, botUser }) {
    const userRepository = createUserRepositoryForBot({ playerUser, botUser });
    const clientState = ClientState({
      userRepository,
      opponentUser: playerUser,
      matchId,
    });
    const matchControllerFactory = MatchControllerFactory({
      socket,
      userRepository,
    });
    const matchController = matchControllerFactory.create({
      dispatch: onMatchControllerDispatch,
      matchId,
      playerIdControllerBot: playerUser.id,
    });
    matchController.start();

    clientState.onUpdate(() => {
      const botSpawner = BotSpawner({
        opponentUserId: playerUser.id,
        clientState,
        matchController,
        rawCardDataRepository,
        userRepository,
        delay: true,
        gameConfig: clientState.gameConfig(),
      });
      botSpawner.spawn();
    });

    async function onMatchControllerDispatch(actionName, value) {
      if (actionName === "stateChanged") {
        try {
          await clientState.update(value);
        } catch (error) {
          console.info("Error on state change from server!");
          console.error(error);
        }
      }
    }
    setTimeout(
      BotSpawner({
        opponentUserId: playerUser.id,
        clientState,
        matchController,
        rawCardDataRepository,
        userRepository,
        delay: true,
        gameConfig: clientState.gameConfig(),
      }).spawn,
      5000
    );
  }

  function createUserRepositoryForBot({ playerUser, botUser }) {
    return {
      getUserById: (id) => {
        if (id === botUser.id) {
          return botUser;
        }
        return playerUser;
      },
      getOwnUser: () => botUser,
    };
  }
};

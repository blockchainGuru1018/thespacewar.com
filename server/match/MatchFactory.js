const Player = require("../player/Player.js");
const Match = require("./Match.js");
const CardDataAssembler = require("../../shared/CardDataAssembler.js");
const CardInfoRepository = require("../../shared/CardInfoRepository.js");
const MatchRegisterLog = require("./service/MatchRegisterLog.js");

const BotId = "BOT";

module.exports = function ({
  socketRepository,
  rawCardDataRepository,
  gameConfig,
  logger,
  userRepository,
}) {
  const cardDataAssembler = CardDataAssembler({ rawCardDataRepository });
  const cardInfoRepository = CardInfoRepository({ cardDataAssembler });

  return {
    create,
    createWithBot,
  };

  function create({ users, endMatch }) {
    const players = users.map(createPlayer);
    const matchId = createId();
    return Match({
      players,
      matchId,
      cardInfoRepository,
      logger,
      rawCardDataRepository,
      gameConfig,
      endMatch: () => endMatch(matchId),
      registerLogGame: MatchRegisterLog({ userRepository }).registerLogGame,
    });
  }

  function createWithBot({ user, endMatch }) {
    const players = [createPlayer(user), createBotForPlayer(user)];
    const matchId = createId();
    return Match({
      players,
      matchId,
      cardInfoRepository,
      logger,
      rawCardDataRepository,
      gameConfig,
      endMatch: () => endMatch(matchId),
      registerLogGame: MatchRegisterLog({ userRepository }).registerLogGame,
    });
  }

  function createPlayer(user) {
    return Player({
      id: user.id,
      name: user.name,
      connection: socketRepository.getForUser(user.id),
    });
  }

  function createBotForPlayer(playerUser) {
    return Player({
      id: BotId,
      name: "Mr.Roboto",
      connection: socketRepository.getForUser(playerUser.id),
    });
  }

  function createId() {
    return Math.round(Math.random() * 1000000)
      .toString()
      .padStart(7, "0");
  }
};

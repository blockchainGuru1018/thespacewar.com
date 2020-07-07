const ajax = require("../utils/ajax.js");

module.exports = function (deps) {
  const socket = deps.socket;
  const userRepository = deps.userRepository;

  return {
    create,
    createWithBot,
    getOwnState,
    onMatchCreatedForPlayer,
  };

  function create({ playerId, opponentId }) {
    return ajax.jsonPost("/match", { playerId, opponentId });
  }

  function createWithBot({ playerId }) {
    return ajax.jsonPost(`/match/${encodeURIComponent(playerId)}/bot`);
  }

  async function getOwnState(matchId) {
    const playerId = userRepository.getOwnUser().id;
    return await ajax.get(`/match/${matchId}/player/${playerId}/state`);
  }

  function onMatchCreatedForPlayer(callback) {
    socket.on("match/create", (matchData) => {
      const ownUserId = userRepository.getOwnUser().id;
      if (matchData.playerIds.includes(ownUserId)) {
        callback(matchData);
      }
    });
  }
};
